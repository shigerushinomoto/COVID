<template>
  <div class="row">
    <div style="background-color: #ffffcc" class="col-md-12 pt-3 mt-3 mb-5 border text-body">
      <p><font size="3" STYLE="font-size : 83%;">This web-application program was developed by Hidetaka Manabe. An 
        original program was formulated by Shinsuke Koyama. The analysis was 
        directed by <a href="http://www.ton.scphys.kyoto-u.ac.jp/~shino/english.html" target="_blank">Shigeru Shinomoto</a>.</font></p>

      <p><font size="3" style="font-size : 83%;">Here, N is the number of particles employed for the sequential Monte 
        Carlo algorithm, and γ is a hyperparameter that characterized the Cauchy distribution of the system equation. 
        In the original paper, N and γ are taken as 1000000 and 0.001, respectively.</font></p>
        
      <p><font size="3" style="font-size : 83%;">[Reference] <a href="https://doi.org/10.1101/2020.07.09.20150219" target="_blank"><br>
      Shinsuke Koyama, Taiki Horie, and Shigeru Shinomoto, Estimating the time-varying reproduction number of COVID-19 with a 
      state-space method. medRxiv preprint doi: https://doi.org/10.1101/2020.07.09.20150219 </a></font></p>
        
      <p id="access"><font size="3" STYLE="font-size : 83%;">Version 1.0: 2020/08/12. Visitors since 2020/08/12:</font><font size="3">: <img border="0" width="40" height="10" id="_x0000_i1030" src="http://www.ton.scphys.kyoto-u.ac.jp/~shino/counter/count.cgi?hawkes"></font> </p>
        
    </div>
  </div>
</template>

<script>
export default {
  name: 'Tail'
}
</script>

<style>
</style>