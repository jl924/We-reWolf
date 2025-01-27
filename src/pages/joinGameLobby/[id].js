import React, { useState, useEffect } from "react";
import axios from "axios";
import GameSettings from "../../comps/gameSettings";
import PlayerList from "../../comps/playerList";
import { useRouter } from "next/router";
import Link from "next/link";

export default function Lobby() {
  const [count, setCount] = useState(0);
  const [playersConnected, setPlayersConnected] = useState([]);
  const [gameLobbyText, setGameLobbyText] = useState("");
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [copy, setCopy] = useState(false);
  const [copyWord, setCopyWord] = useState("Copy To Clipboard");
  const [selected, setSelected] = useState([]);
  const [urlCode, setUrlCode] = useState([]);
  const [username, setUserName] = useState("");
  const router = useRouter();
  const { id } = router.query;



  function createGame() {
    const createGameObject = {
      gameID: gameLobbyText,
      users: assignRoles(playersConnected),
      // phase: "day",
    };
    console.log(createGameObject, "********************");
    axios
      .post(`http://localhost:3000/api/createGame`, createGameObject)
      .then((res) => console.log(res))
      .catch((err) => console.log(err));
  }

  function getUserNames() {

    axios
      .get(`http://localhost:3000/api/lobby/${id}`)
      .then((res) => {
        console.log("RES from GetUserNames", res)
        setPlayersConnected(res.data[0].users)
        if(res.data[0].hasStarted){
          router.push(`http://localhost:3000/game/${id}`)
        } else {
          setTimeout(getUserNames, 3000);
        }
      })
      .catch((err) => console.log(err));


    }

  //***************************Can be Delete Once Pull confirmed working*************************************************** */
  // function hostLobby() {
  //   axios.post(`http://localhost:3000/api/lobby/${gameLobbyText}`, {user:  username}).then((res) => console.log('RES from HostLobby POST Req',res)).catch((err) => console.log(err));
  // }
  // function joinLobby() {
  //   axios.put(`http://localhost:3000/api/lobby/${gameLobbyText}`, {user:  username}).then((res) => console.log('RES from HostLobby PUT Req',res)).catch((err) => console.log(err));
  // }
  // useEffect(() => {
  //   let gameID = router.query.id
  //   const options = {
  //     method:"POST",
  //     url: `http://localhost:3000/api/lobby/${gameID}`
  //   }
  //   axios(options)
  //   .then(data => {
  //     setPlayersConnected(data)
  //   })
  //   .catch(console.log)
  // }, [])
  //****************************Can be Delete Once Pull confirmed working*************************************************** */

  function getUserName() {
    setUserName(window.localStorage.user);
    console.log("USERNAME", username);
  }

  function assignRoles(arrayOfPlayers) {
    let rankArray = arrayOfPlayers.map((player) => {
      if (player.rank == 1) {
        const returnObj = {
          ...player,
          rank: player.rank * Math.floor(Math.random() * 20),
          role: "villager",
        };
        console.log('random roles:\n');
        return returnObj;
      }
      return player;
    });
    let sortedArray = rankArray.sort((a, b) => a.rank - b.rank);
    if (sortedArray.length <= 8) {
      sortedArray[0].role = "werewolf";
      if (selected.includes("Doctor")) {
        sortedArray[sortedArray.length - 1].role = "Doctor";
      }
      if (selected.includes("Seer")) {
        sortedArray[sortedArray.length - 2].role = "Seer";
      }
    } else if (sortedArray.length > 8 && sortedArray.length < 12) {
      sortedArray[0].role = "werewolf";
      sortedArray[1].role = "werewolf";
      if (selected.includes("Doctor")) {
        sortedArray[sortedArray.length - 1].role = "Doctor";
      }
      if (selected.includes("Seer")) {
        sortedArray[sortedArray.length - 2].role = "Seer";
      }
    } else {
      sortedArray[0].role = "werewolf";
      sortedArray[1].role = "werewolf";
      sortedArray[2].role = "werewolf";
      if (selected.includes("Doctor")) {
        sortedArray[sortedArray.length - 1].role = "Doctor";
      }
      if (selected.includes("Seer")) {
        sortedArray[sortedArray.length - 2].role = "Seer";
      }
    }
    console.log(sortedArray)
    return sortedArray.map((player) => {
      return { ...player, rank: 0, permissions: [player.role === 'werewolf' ? 'werewolf' : '', 'all', player.username] };
    });
  }

  function gameLobbyChangeHandler(event) {
    setGameLobbyText(event.target.value);
  }
  function getCookie(name) {
    let value = `; ${document.cookie}`;
    let parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
  }

  useEffect(() => {}, [count]);

  useEffect(() => {
    //if they are not Host
    if (getCookie("isHost") === "false") {
      setButtonDisabled(true);
    } else {
      //add a POST request to update users in lobby
    }
    setGameLobbyText(router.query.id)
    getUserName();
    getUserNames(router.query.id)
  }, []);

  let copyClick = () => {
    navigator.clipboard.writeText(gameLobbyText);
    setCopy(true);
    setCopyWord("Copied !");
  };

  return (
    <div style={containerStyle}>
      <div style={boxStyle}>
        <div style={titleStyle}>Lobby</div>
        <div style={contentStyle}>
          <div style={listStyle}>
            <h2 style={listHeaderStyle}>Player List</h2>
            <PlayerList
            players ={playersConnected}
            count={count} />
          </div>
          <div style={listStyle}>
            <h2 style={listHeaderStyle}>Role List</h2>
            <GameSettings
              selected={selected}
              setSelected={setSelected}
              count={count}
              buttonDisabled={buttonDisabled}
              setCount={setCount}
            />
          </div>
        </div>
        <div style={footerStyle}>
          <button
            onClick={copyClick}
            style={copy ? clickedButtonStyle : buttonStyle}
          >
            {copyWord}
          </button>
          <input
            style={inputStyle}
            onChange={gameLobbyChangeHandler}
            value={gameLobbyText}
          ></input>

          <Link href={`http://localhost:3000/game/${gameLobbyText}`}>
            <button
              className="startButton"
              disabled={buttonDisabled}
              style={buttonStyle2}
              onClick={() => createGame()}
            >
              Start Game
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

const containerStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "80vh",
};

const boxStyle = {
  width: "60vw",
  height: "80vh",
  backgroundColor: "rgba(255, 255, 255, 0.75)",
  padding: "20px",
  borderRadius: "4px",
  boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.1)",
  marginTop: "50px",
};

const titleStyle = {
  fontSize: "24px",
  fontWeight: "bold",
  marginBottom: "20px",
  textAlign: "center",
};

const contentStyle = {
  display: "flex",
};

const listStyle = {
  flex: "1",
  border: "1px solid darkgrey",
  minHeight: "60vh",
  borderRadius: "4px",
  padding: "10px",
  marginRight: "20px",
};

const listHeaderStyle = {
  marginBottom: "10px",
};

const footerStyle = {
  marginTop: "20px",
  display: "flex",
  alignItems: "center",
};

const inputStyle = {
  flex: "1",
  padding: "8px",
  backgroundColor: "white",
  border: "1px solid black",
  borderRadius: "50px",
  marginLeft: "10px",
};

const buttonStyle = {
  marginLeft: "10px",
  padding: "8px 16px",
  backgroundColor: "#007bff",
  color: "#fff",
  border: "none",
  cursor: "pointer",
};

const clickedButtonStyle = {
  marginLeft: "10px",
  padding: "8px 16px",
  backgroundColor: "#2A303C",
  color: "white",
  border: "none",
  cursor: "pointer",
};

const buttonStyle2 = {
  marginLeft: "10px",
  padding: "8px 16px",
  backgroundColor: "#ffbd03",
  color: "#fff",
  border: "none",
  cursor: "pointer",
  borderRadius: "5px",
};
