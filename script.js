console.log("Let's write javascript");

let currSong = new Audio();
let currFolder;
let songs;

 async function getSongs(folder) {
  let a = await fetch(`/${folder}/`);
  // console.log(a);
  currFolder = folder;
  let responce = await a.text();
  let div = document.createElement("div");
  div.innerHTML = responce;
  let as = div.getElementsByTagName("a");
  songs = [];
  for (let idx = 0; idx < as.length; idx++) {
    const element = as[idx];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`/${folder}/`)[1]);
    }
  }

  // show all the song in the playlist
  let songUl = document
    .querySelector(".song-list")
    .getElementsByTagName("ul")[0];

  songUl.innerHTML = "";

  for (const song of songs) {
    songUl.innerHTML =
      songUl.innerHTML +
      `<li>

    <img class="invert" src="music.svg" alt="">
    <div class="info">
      <div class = "song-name"> ${song.replaceAll("%20", " ")} </div>
      <div class="singer">Durgesh Yadav</div>
    </div>
    <div class="playNow">
      <span>Play Now</span>
      <img  class="invert" src="play.svg" alt="">
    </div>
    
    
    </li>`;
  }

  // Attach an event listerener to each song

  Array.from(
    document.querySelector(".song-list").getElementsByTagName("li")
  ).forEach((e) => {
    //  console.log(e.querySelector(".info").firstElementChild.innerHTML);

    e.addEventListener("click", (element) => {
      playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
    });
  });

  return songs;
}

const playMusic = (track, pause = false) => {
  // let audio=new Audio("http://127.0.0.1:5500/spotify/songs/"+track)

  currSong.src = `/${currFolder}/` + track;
  if (!pause) {
    currSong.play();
    play.src = "pause.svg";
    // console.log(currSong.currentSrc.split("/songs/")[1])
  }
  document.querySelector(".song-info").innerHTML = decodeURI(track);
  document.querySelector(".song-time").innerHTML = "00:00/00:00";
};

function convertSecondsToMinutes(seconds) {
  // Calculate the minutes and remaining seconds

  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }
  const minutes = Math.floor(seconds / 60).toFixed(0);

  const remainingSeconds = (seconds % 60).toFixed(0);

  // Format the remaining seconds to always be two digits
  const formattedSeconds =
    remainingSeconds < 10 ? "0" + remainingSeconds : remainingSeconds;

  // Return the formatted string
  return minutes + ":" + formattedSeconds;
}

async function displayAlbums() {
  let a = await fetch(`/songs/`);

  let responce = await a.text();
  let div = document.createElement("div");
  div.innerHTML = responce;
  let anchors = div.getElementsByTagName("a");
  let cardContainer = document.querySelector(".cardContainer");
  let array = Array.from(anchors);
  // console.log(array)
  for (let index = 0; index < array.length; index++) {
    const e = array[index];

    if (e.href.includes("/songs/") && !e.href.includes(".htaccess")) {
      console.log(e)
      let folder = e.href.split("/").slice(-2)[1];
      console.log(folder);

      // get meta data of each folder
      let a = await fetch(`/songs/${folder}/info.json`);
      let responce = await a.json();
      console.log(responce);
      cardContainer.innerHTML =
        cardContainer.innerHTML +
        `<div data-folder="${folder}" class="card">
    <div  class="play-btn">
      <i class="fas fa-play play-icon"></i>
    </div>
    <img alt=""  src="/songs/${folder}/cover.jpeg">
    <h2>${responce.title}</h2>
    <p>${responce.description}</p>
  </div>
`;
    }
  }

  // load the plyalist whenever card is clicked
  Array.from(document.getElementsByClassName("card")).forEach((e) => {
    e.addEventListener("click", async (item) => {
      console.log("Fetching songs")
      songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
      playMusic(songs[0]);
    });
  });
}

async function main() {
  // list of all songs
  await getSongs("songs/Hindi");
  // console.log(songs)

  playMusic(songs[0], true);
  // console.log(songs);

  // display all the album
  await displayAlbums();

  // Attach an event listerener to next,play and previous

  // console.log(play);
  play.addEventListener("click", () => {
    if (currSong.paused) {
      currSong.play();
      play.src = "pause.svg";
    } else {
      currSong.pause();
      play.src = "play.svg";
    }
  });

  // listen for the timeupdate event
  currSong.addEventListener("timeupdate", () => {
    document.querySelector(".song-time").innerHTML = `${convertSecondsToMinutes(
      currSong.currentTime
    )} / ${convertSecondsToMinutes(currSong.duration)}`;

    // now updating the position of the circle according to the current time of the song
    document.querySelector(".circle").style.left =
      (currSong.currentTime / currSong.duration) * 100 + "%";
  });

  // add an event listurener to the seak bar
  document.querySelector(".seekbar").addEventListener("click", (e) => {
    //console.log(e);
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currSong.currentTime = (currSong.duration * percent) / 100
  });

  // now adding event listerener to the previous
  document.querySelector("#previous").addEventListener("click", () => {
    currSong.pause();
    console.log("Played previous song");
    let index = songs.indexOf(currSong.currentSrc.split("/").slice(-1)[0]);
    // console.log(index)
    if (index - 1 >= 0) {
      playMusic(songs[index - 1]);
    } else {
      playMusic(songs[index]);
    }
  });

  // now adding the event listerener to teh next button
  document.querySelector("#next").addEventListener("click", () => {
    currSong.pause();
    console.log("Played next song ");
    let index = songs.indexOf(currSong.currentSrc.split("/").slice(-1)[0]);
    if (index + 1 < songs.length) {
      playMusic(songs[index + 1]);
    } else {
      playMusic(songs[index]);
    }
  });

  // Add event listener to the hamburger
  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  });

  // adding event listener to the cross button
  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%";
  });

  // add event to the volume
  document
    .querySelector(".range")
    .getElementsByTagName("input")[0]
    .addEventListener("change", (e) => {
      currSong.volume = parseInt(e.target.value) / 100;
    });
}

main();
