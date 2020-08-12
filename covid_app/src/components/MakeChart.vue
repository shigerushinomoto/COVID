<template>
  <div>
    <div class="row">
        <div class="pt-3">
            <form name="data">
                <div class="form-group">
                    <p>
                    <button id="sample" type="button" class="btn btn-outline-dark" @click="loadCsvFile('sample.csv')">Sample</button>
                    <button id="Italy" type="button" class="btn btn-outline-dark" @click="loadCsvFile('sample_Italy.csv')">Italy</button>
                    <button id="Japan" type="button" class="btn btn-outline-dark" @click="loadCsvFile('sample_Japan.csv')">Japan</button>
                    <button id="SaudiArabia" type="button" class="btn btn-outline-dark" @click="loadCsvFile('sample_SaudiArabia.csv')">SaudiArabia</button>
                    <button id="USA" type="button" class="btn btn-outline-dark" @click="loadCsvFile('sample_USA.csv')">USA</button>
                    </p>
                </div>
            </form>
        </div>
    </div>
    <div class="row justify-content-center">
      <div class="col-md-10">
        <form name="data">
          <div class="form-group">
            <textarea class="form-control" id="input" rows="3" v-model="inputData"></textarea> 
          </div>
        </form>
      </div>
    </div>
    <div class="row">
      <div class="col-md-10">
        <form class="form-inline">
          <label for="text" class="mr-sm-2">N:</label>
          <input class="form-control mr-sm-2" size="10" v-model="N">
          <label for="text" class="mr-sm-2">γ:</label>
          <input class="form-control mr-sm-2" size="10" v-model="gm">
        </form>
      </div>
    </div>
    <br> 
    <div class="row">
      <div class="pb-1">
        <div id="estimate" v-if="est_normal">
          <button type="button" class="btn btn-success" @click="exeEstimate()">estimate</button>
        </div>
        <div v-else>
          <button type="button" class="btn btn-secondary" @click="exeEstimate()">estimating</button>
          <span class='spinner-border spinner-border-sm'></span>
        </div>
      </div>
    </div>
    <br>
    <div class="row">
      <div class="col-md-12">
        <Chart :chart-data="chartData1" :height="height1"></Chart>
      </div>
      <div class="col-md-12">
        <Chart2 :chart-data="chartData2" :height="height2"></Chart2>
      </div>
    </div>
  </div>
</template>

<script>
import Chart from './Chart'
import Chart2 from './Chart2'
import rnssest from './rnssest'

export default {
    name: 'MakeChart',
    components: {
      Chart,
      Chart2
    },
    data: function () {
      return {
        /*inputData: `0	172	0	21	59	72	3	197	220	290	88	
          193	155	356	308	395	785	296	375	372	807	966	1106	1528	
          694	749	837	1517	1829	4087	3125	1937	1581	2383	2797	2775	
          3255	3294	1769	1364	1550	1967	2891	2478	2070	1059	892	
          1318	1526	1632	1497	1557	1107	513	986	803	1434	1275	939	
          600	365	585	362	756	787	448	403	357	256	466	349	648	518	138	295	
          210	390	423	260	398	169	144	147	247	158	335	116	138	106	76	240	
          160	274	198	365	107	141	215	231	382	236	131	132	107	144	218	293	
          170	83	210	98	236	158	126	158	135	90	199	114	240`,*/
        inputData: [],
        chartData1: null,
        chartData2: null,
        labelData: null,
        height1: 200,
        height2: 200,
        N: 1000,
        gm: 0.001,
        est_normal: true,
      }
    },
    created: async function () {
      await this.loadData()
      await this.initChart()
    },
    methods: {
      loadData() {
        return new Promise(resolve => {
          this.loadCsvFile("sample.csv")
          setTimeout(function() {
            resolve();
          }, 10);
        });
      },
      initChart() {
        return new Promise(resolve => {
          let inputNumData = this.inputData.split(/,|\s/).filter(function(v){return v!=""}).map(Number)
          this.labelData = []
          for (let i=0; i<inputNumData.length; i++) this.labelData.push(i)
          this.drawChart(inputNumData, [], [], [], [])
          
          setTimeout(function() {
            resolve();
          }, 10);
        });
        
      },
      async exeEstimate() {
        await this.changeEstBtn(this.est_normal)
        await this.fillData()
        await this.changeEstBtn(this.est_normal)
      },
      changeEstBtn (est_n) {
        return new Promise(resolve => {
          this.est_normal = !est_n
          setTimeout(function() {
            resolve();
          }, 100);
        });
      },
      loadCsvFile(dataPath) {
        const request = new XMLHttpRequest();
        request.open('GET', dataPath, false)
        request.send(null)
        this.inputData = request.responseText.split(/,|\s/).filter(function(v){return v!=""}).map(Number)
      },

      fillData () {
        let inputNumData = this.inputData
        if (typeof (this.inputData) == "string") {
          inputNumData = this.inputData.split(/,|\s/).filter(function(v){return v!=""}).map(Number)
        }
        console.log(inputNumData)
        this.labelData = []
        for (let i=0; i<inputNumData.length; i++) this.labelData.push(i)
        
        let [n, R, itvl, rate] = rnssest(inputNumData, Number(this.N), Number(this.gm))

        this.drawChart(inputNumData, n, R, itvl, rate)

        return new Promise(resolve => {
          setTimeout(function() {
            resolve();
          }, 10);
        });
      },
      drawChart(inputNumData, n, R, itvl, rate) {
        this.chartData1 = {
          labels: this.labelData,
          datasets: [
          {
            label: 'original data',
            data: inputNumData,
            showLine: true,
            borderColor: 'rgba(60, 220, 150, 0.8)',
            lineTension: 0,
            pointRadius: 0,
            fill: false,
            type: "scatter"
          },
          {
            label: 'adjusted data',
            data: n,
            showLine: true,
            borderColor: 'rgba(250, 20, 30, 0.8)',
            lineTension: 0,
            pointRadius: 0,
            fill: false,
            type: "scatter"
          },
          {
            label: 'estimated data',
            data: rate,
            showLine: true,
            borderColor: 'rgba(30, 220, 250, 0.8)',
            lineTension: 0,
            pointRadius: 0,
            fill: false,
            type: "scatter"
          }]
        }
        this.chartData2 = {
          labels: this.labelData,
          datasets: [
          {
            label: 'estimated R',
            data: R,
            showLine: true,
            borderColor: 'rgba(60, 220, 150, 0.8)',
            lineTension: 0,
            pointRadius: 0,
            fill: false,
            type: "scatter"
          },
          {
            label: '2.5',
            data: itvl[0],
            showLine: true,
            borderColor: 'rgba(250, 20, 30, 0.8)',
            lineTension: 0,
            pointRadius: 0,
            fill: false,
            type: "scatter"
          },
          {
            label: '97.5',
            data: itvl[1],
            showLine: true,
            borderColor: 'rgba(30, 220, 250, 0.8)',
            lineTension: 0,
            pointRadius: 0,
            fill: false,
            type: "scatter"
          }]
        }
      },
      convertCsvStringToArray(str) {
        return str.split("\n").map(s => s.split(","));
      }
    }
}
</script>

<style>
</style>