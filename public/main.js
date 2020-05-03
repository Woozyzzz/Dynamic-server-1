console.log(`我是main.js`);
const request = new XMLHttpRequest();
request.open("GET", "/1.js");
request.onreadystatechange = () => {
  if (request.readyState === 4 && request.status === 200) {
    console.log("success");
  }
};
request.send();
