<template>
    <div >
        <el-form :model="form" label-width="120px">
    <el-form-item label="proposal name">
      <el-input v-model="form.name" />
    </el-form-item>
    <el-form-item label="Activity time">
      <el-col :span="11">
        <el-date-picker
          v-model="form.date1"
          type="date"
          placeholder="Pick a date"
          style="width: 100%"
        />
      </el-col>
      <el-col :span="2" class="text-center">
        <span class="text-gray-500">-</span>
      </el-col>
      <el-col :span="11">
        <el-time-picker
          v-model="form.date2"
          placeholder="Pick a time"
          style="width: 100%"
        />
      </el-col>
    </el-form-item>
   <el-button>propose</el-button>
  </el-form>
</div>
</template>

<script >
export default {
    data() {
        return {
            form: {
                name: '',
                region: '',
                date1: null,
                date2: null,
                delivery: false,
                type: [],
                resource: '',
                desc: ''
            }
        }
    },
    methods: {
        onSubmit() {
            console.log('submit!');
        }
    }
}
</script>
