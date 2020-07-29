<script>
import { Bar, mixins } from 'vue-chartjs'
const { reactiveProp } = mixins

export default {
  extends: Bar,
  name: 'chart2',
  mixins: [reactiveProp],
  props: ['chartData2', 'options'],
  mounted () {
    this.renderChart(this.chartData2, this.options)
  }
}
</script>