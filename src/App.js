import React from 'react';
import io from 'socket.io-client';
import logo from './logo.svg';
import './App.css';

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.socket = io.connect({
      path: '/soc'
    });
    this.socket.on('fetch', async ({ start, end }, resp) => {
      console.log(start, end)
      const arrayBuffer = await this.file.slice(start, Math.max(end, this.file.size), this.file.type);
      resp({
        data: arrayBuffer,
        size: this.file.size,
      });
    });
  }

  fileSelected = async (e) => {
    // console.log(e.target.files)
    const file = e.target.files[0];
    // this.file = e.target.files[0];
    // this.setState({ video: "http://localhost:8080/video" })
    const totalSize = file.size;



    const mediaSource = new MediaSource();
    this.setState({ video: URL.createObjectURL(mediaSource) });
    await new Promise((resolve) => {
        mediaSource.addEventListener('sourceopen', resolve, { once: true });
    });
    // mediaSource.duration = 5;

    const sourceBuffer = mediaSource.addSourceBuffer("video/mp4;codecs=avc1.640828");
    // const arrayBuffer = await file.arrayBuffer();
    // sourceBuffer.addEventListener('updateend', function (_) {
      // console.log(mediaSource.readyState); // ended
      // mediaSource.endOfStream();
      // video.play();
    // });

    // const a = new Promise((resolve, reject) => {
    // sourceBuffer.addEventListener('updateend', (...a) => console.log(a));
    // sourceBuffer.addEventListener('error', (...a) => console.log(a));
    // });
    // sourceBuffer.appendBuffer(arrayBuffer);
    // console.log(await a.catch(e => {
    //   console.log(e.error)
    // }))

    const chunks = Math.ceil(file.size/10000);
    let total = 0;
    sourceBuffer.addEventListener('updateend', (...a) => {
      console.log(a)
      total+=1;
      if (total === chunks) {
            mediaSource.endOfStream();
      }
    });
    sourceBuffer.addEventListener('error', (...a) => console.log(a));
    for (let start = 0; start < totalSize;) {
      let end = start + 10000;
      if (end > totalSize) {
        end = totalSize;
      }





      // Reads aren't guaranteed to finish in the same order they're started in,
      // so we need to read + append the next chunk after the previous reader
      // is done (onload is fired).

      await new Promise(resolve => {
        var reader = new FileReader();
        reader.onload = function (e) {
          sourceBuffer.appendBuffer(new Uint8Array(e.target.result));
          console.log('appending chunk:' + start);
          // if (i == NUM_CHUNKS - 1) {
          //   mediaSource.endOfStream();
          // } else {
            // if (video.paused) {
            //   video.play(); // Start playing after 1st chunk is appended.
            // }
            resolve()
            // readChunk_(++i);
          // }
        };

        console.log(Math.min(end, file.size))
        var chunk = file.slice(start, Math.min(end, file.size), file.type);

        reader.readAsArrayBuffer(chunk);
      })




      // const arrayBuffer = await file.slice(start, end, file.type).arrayBuffer()
      // await new Promise((resolve, reject) => {
      //   sourceBuffer.addEventListener('updateend', (...a) => console.log(a)||resolve());
      //   sourceBuffer.addEventListener('error', (...a) => console.log(a)||reject());
      //   sourceBuffer.appendBuffer(arrayBuffer);
      // })
      start = end;
      // mediaSource.endOfStream();
      // return;
    }
            // mediaSource.endOfStream();

    // sourceBuffer.addEventListener('updateend', function (_) {
    //   mediaSource.endOfStream();
    //   // video.play();
    //   //console.log(mediaSource.readyState); // ended
    // });
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          {/* TODO: restrict to 1 video file */}
          <input type="file" onChange={this.fileSelected} />

          {/* TODO: figure out the mkv format */}
          {this.state.video ? (
            <video src={this.state.video} type='video/webm' controls></video>
          ) : null}
          {/*
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a> */}
        </header>
      </div>
    );
  }
}
