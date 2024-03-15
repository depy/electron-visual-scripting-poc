/**
 * This file will automatically be loaded by vite and run in the "renderer" context.
 * To learn more about the differences between the "main" and the "renderer" context in
 * Electron, visit:
 *
 * https://electronjs.org/docs/tutorial/application-architecture#main-and-renderer-processes
 *
 * By default, Node.js integration in this file is disabled. When enabling Node.js integration
 * in a renderer process, please be aware of potential security implications. You can read
 * more about security risks here:
 *
 * https://electronjs.org/docs/tutorial/security
 *
 * To enable Node.js integration in this file, open up `main.ts` and enable the `nodeIntegration`
 * flag:
 *
 * ```
 *  // Create the browser window.
 *  mainWindow = new BrowserWindow({
 *    width: 800,
 *    height: 600,
 *    webPreferences: {
 *      nodeIntegration: true
 *    }
 *  });
 * ```
 */

import './index.css';
import './nodes'

document.querySelector('#btn1').addEventListener('click', (e) => {
    let n = document.createElement("node-element");
    document.querySelector("#editor").prepend(n);
});

document.querySelector('#btn2').addEventListener('click', (e) => {
    let n = document.createElement("num-node");
    document.querySelector("#editor").prepend(n);
});

document.querySelector('#btn3').addEventListener('click', (e) => {
    let n = document.createElement("sum-node");
    document.querySelector("#editor").prepend(n);
});

let n1 = document.createElement("sum-node") as SumNode;
document.querySelector("#editor").prepend(n1);

let n2 = document.createElement("num-node") as NumNode;
document.querySelector("#editor").prepend(n2);

let n3 = document.createElement("num-node") as NumNode;
document.querySelector("#editor").prepend(n3);

n1.setA(n2);
n1.setB(n3);

// let n4 = document.createElement("connection-element") as ConnectionElement;
// document.querySelector("#connections-container").append(n4);