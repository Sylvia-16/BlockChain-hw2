<template>
  <div class="common-layout">
    <el-container>
      <el-header>
      <h1>社团</h1>
      </el-header>
      <el-main> <HelloWorld msg="Welcome to Your Vue.js App"/>
      <el-row class="mb-4">
      <proposal></proposal>
      </el-row>
      <vote></vote>
      </el-main>
    </el-container>
  </div>
 
</template>

<script>
import HelloWorld from './components/join.vue'
import proposal from './components/Proposal.vue'
import vote from './components/vote.vue'
export default {
  name: 'App',
  components: {
    HelloWorld,
    proposal,
    vote
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
