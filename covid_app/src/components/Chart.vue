<script>
import { Bar, mixins } from 'vue-chartjs'
const { reactiveProp } = mixins

export default {
  extends: Bar,
  name: 'chart',
  mixins: [reactiveProp],
  props: ['chartData1', 'options'],
  mounted () {
    this.renderChart(this.chartData1, this.options)
  }
}
</script>