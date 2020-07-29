import { erf } from "mathjs"
import * as d3 from "d3"

var gammaln = require( 'math-gammaln' )

export default function rnssest (z, N, gm) {

  // 欠損データに対して0埋め
  let I = Array(z.length).fill(0)
  let nan_index = []
  for (let i = 0; i < z.length; i++) {
    if (Number.isNaN(z[i])) {
      z[i] = 0;
      I[i] = 1;
      nan_index.push(i)
    }
  }

  let n = adjustdaily(z)

  const eps = Math.pow(2, -52)

  let T = n.length
  let mu = eps

  let rho = rhoest(n, 7)
  let d = 30
  let L = 30
  let m = 4.7
  let sd = 2.9

  let pk_mu = Math.log(m / Math.sqrt(1 + (sd/m)**2))
  let pk_sg2 = Math.log(1 + (sd/m)**2)

  // sx = zeros(d,N,L)
  let sx = Array.from(new Array(d), () => {
    return Array.from(new Array(N), () => new Array(L).fill(0))
  })

  let R = []
  let itvl_25 = []
  let itvl_975 = []

  let px = new Array(d)
  for (let i = 0; i < d; i++) {
    px[i] = new Array(N)
    for (let j = 0; j < N; j++) {
      px[i][j] = Math.random() * 10
    }
  }

  for (let t = 0; t < T; t++) {
    // sx(:, :, end) = px
    for (let i = 0; i < d; i++) {
      for (let j = 0; j < N; j++) {
        sx[i][j][L-1] = px[i][j]
      }
    }

    // nanなindexを飛ばす
    if (!nan_index.includes(t)) {
      let n0 = new Array(d)
      for (let i = 0; i < d; i++) {
        if (t-i-1 >= 0) n0[i] = n[t-i-1]
        else n0[i] = 0
      }
      let lm = new Array(N).fill(0)
      for (let i = 0; i < N; i++) {
        lm[i] = mu
        for (let j = 0; j < L; j++) {
          lm[i] += n0[j] * knl(j+1, pk_mu, pk_sg2) * px[j][i]
        }
      }
      let w = new Array(N).fill(0)
      for (let i = 0; i < N; i++) {
        if (rho > 0) {
          w[i] = nbinpdf(n[t], lm[i], rho)
        } else {
          w[i] = poisspdf(n[t], lm[i])
        }
      }
      // w is not zero array
      if (!w.every(v => v == 0)) {
        // random sampling with replacement
        let oldsx = sx.concat()
        let newp_log = []
        for (let i = 0; i < N; i++) {
          let newp = randsample(N, w)
          newp_log.push(newp)
          for (let j = 0; j < d; j++) {
            for (let k = 0; k < L; k++) {
              sx[j][i][k] = oldsx[j][newp][k]            
            }
          }
        }
        // console.log("t:", t, "n[t]", n[t], "lm:", lm, "w", w, "newp:", newp_log)
      }
    }
    // median
    let tmp_sample = []
    for (let i = 0; i < N; i++) {
      tmp_sample.push(sx[0][i][0])
    }
    tmp_sample = tmp_sample.sort(function(a,b){return a-b})
    R.push(d3.median(tmp_sample))
    //itvl.push([d3.quantile(tmp_sample, 0.025), d3.quantile(tmp_sample, 0.975)])
    itvl_25.push(d3.quantile(tmp_sample, 0.025))
    itvl_975.push(d3.quantile(tmp_sample, 0.975))

    //let oldpx = px.concat()
    for (let i = 0; i < d; i++) {
      for (let j = 0; j < N; j++) {
        if (i == 0) {
          px[i][j] = Math.max(sx[i][j][L-1] + cauchyrnd(0, gm), 0)
        } else {
          px[i][j] = Math.max(sx[i-1][j][L-1], 0)
        }
      }
    }
    let oldsx = sx.concat()
    for (let i = 0; i < d; i++) {
      for (let j = 0; j < N; j++) {
        for (let k = 0; k < L-1; k++) {
          sx[i][j][k] = oldsx[i][j][k+1]
        }
      }
    }
  }

  for (let t = 0; t < L-1; t++) {
    let tmp_sample = []
    for (let i = 0; i < N; i++) tmp_sample.push(sx[0][i][t])
    tmp_sample = tmp_sample.sort(function(a,b){return a-b})
    R.push(d3.median(tmp_sample))
    //itvl.push([d3.quantile(tmp_sample, 0.025), d3.quantile(tmp_sample, 0.975)])
    itvl_25.push(d3.quantile(tmp_sample, 0.025))
    itvl_975.push(d3.quantile(tmp_sample, 0.975))
  }

  R = R.slice(L)
  //itvl = itvl.slice(L)
  itvl_25 = itvl_25.slice(L)
  itvl_975 = itvl_975.slice(L)

  let rate = []
  for (let t = 0; t < T; t++) {
    let h = 0
    for (let i = 0; i < t; i++) {
      h += R[i] * n[i] * knl(t-i, pk_mu, pk_sg2)
    }
    rate.push(mu+h)
  }

  if (z != null && N != null && gm != null) {
    return [n, R, [itvl_25, itvl_975], rate]
  } else {
    return [1, 2, 3]
  }
}

// daily adjustment of data
function adjustdaily(z) {
  let T = z.length
  let s = Math.floor(T/7)
  let bt = [0, 0, 0, 0, 0, 0, 0]
  let zsum = 0

  for (let i = 0; i < s * 7; i++) {
    bt[i%7] += z[i];
    zsum += z[i];
  }
  if (bt.includes(0)) return z

  for (let i = 0; i < 7; i++) bt[i] = bt[i] * 7 / zsum
  return z.map((value, index) => Math.round(value / bt[index%7]))
}

// estimate rho
function rhoest(n, l) {
  // l should be odd.
  let mn = Array(n.length).fill(0)
  for (let i = 0; i < Math.ceil(l/2); i++) mn[0] += n[i]
  for (let i = 1; i < n.length; i++) {
    mn[i] = mn[i-1]
    // TODO: ズレる可能性あり
    if (i - Math.ceil(l/2) >= 0) mn[i] -= n[i - Math.ceil(l/2)]
    if (i + Math.floor(l/2) < n.length) mn[i] += n[i + Math.floor(l/2)]
  }
  for (let i = 0; i < n.length; i++) {
    if (i - Math.floor(l/2) < 0) mn[i] /= (l + i - Math.floor(l/2))
    else if (i + Math.floor(l/2) >= n.length) mn[i] /= (l - (i + Math.floor(l/2) + 1 - n.length))
    else mn[i] /= l
  }
  let rho = 0
  for (let i = 0; i < n.length; i++) {
    if (mn[i] != 0) rho += (n[i] - mn[i])**2 / mn[i]
  }
  rho = rho / n.length - 1
  return rho
}

// kernel function
// matlab verと違い，index dはスカラー
function knl(d, pk_mu, pk_sg2) {
  let P_d = P(d, pk_mu, pk_sg2)
  let P_d1 = P(d-1, pk_mu, pk_sg2)
  return P_d - P_d1
}
function P(d, pk_mu, pk_sg2) {
  return 0.5 * erfc(-(Math.log(d)-pk_mu)/(Math.sqrt(2*pk_sg2)))
}

function erfc(x) {
  return 1 - erf(x)
}

// negarive binomial pdf
// n, lm, rho: scalar
function nbinpdf(n, lm, rho) {
  // gammalnについては問題があれば対処
  //return gamma(n+lm/rho) / (gamma(n+1) * gamma(lm/rho)) * Math.pow(rho/(1+rho),n) * Math.pow(1/(1+rho),lm/rho)
  return Math.exp(gammaln(n+lm/rho)-gammaln(n+1)-gammaln(lm/rho)+n*Math.log(rho/(1+rho))-lm/rho*Math.log(1+rho))
}

// poisson pdf
function poisspdf(n, lm) {
  return Math.exp(n*Math.log(lm)-lm-gammaln(n+1))
}

// function for sampling with weight
// N = w.length
function randsample(N, w) {
  let c_sum = []
  c_sum.push(0)
  for (let i = 0; i < N; i++) {
    c_sum.push(w[i] + c_sum[i])
  }
  let v = Math.random() * c_sum[N]
  let imin = 0;
  let imax = N;
  let index = Math.floor((imin + imax) / 2)
  while (imax != index && imin != index) {
    if (c_sum[index] < v) {
      imin = index;
    } else {
      imax = index;
    }
    index = Math.floor((imin + imax) / 2)
  }
  return index
}

// cauchy random number
function cauchyrnd(x0, gm) {
  return x0 + gm * Math.tan(Math.PI * (Math.random() - 0.5))
}