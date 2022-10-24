import { createApp } from "vue";

// import Vue from "vue";
import App from "./App.vue";
// import Web3 from "web3/dist/web3.min.js";
// const web3 = new Web3(
//   Web3.givenProvider || "wss://some.local-or-remote.node:8546"
// );
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
// Vue.config.productionTip = false;
// Vue.prototype.Web3 = Web3;
createApp(App).use(ElementPlus).mount("#app");
