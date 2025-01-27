import React from "react"
import { useState, useEffect, useMemo } from "react"
import { createAvatar } from "@dicebear/core";
import { lorelei } from "@dicebear/collection";
import { avataaars } from "@dicebear/collection";
import { micah } from "@dicebear/collection";
import Image from "next/image";
import axios from "axios";

var playerStyle = {
  textAlign: "center",
}
var playerStyleDead = {
  textAlign: "center",
  transform: "rotate(180deg)"
}
var playerStyleHover = {
  textAlign: "center",
  background: 'radial-gradient(#e66465, #9198e5)',
  borderRadius: '50%',
  color: "white",
}
var playerStyleNight = {
  textAlign: "center",
  color: "white",
}
var voteStyle = {
  border: 'solid',
  borderColor: 'red',
  backgroundColor: 'red',
  borderRadius: '50%',
  width: '25px',
  position: 'absolute',
  top: '5px',
  right: '5px',
  textAlign: "center",
  color: "white",
}

const tombstoneUrl = '/tombstone.png';

const Avatar = ({ player, thisPlayerCanSelect, selected, setSelected, setLastSelected, gameID }) => {
  const [style, setStyle] = useState(playerStyle);
  const [votes, setVotes] = useState(player.votes || 0);
  const [canHover, setCanHover] = useState(player.isAlive);
  const [canSelect, setCanSelect] = useState(thisPlayerCanSelect);
  const [isSelected, setIsSelected] = useState(player === selected);
  const [isSelectedLagFrame, setIsSelectedLagFrame] = useState(player === selected);


  const avatar = useMemo(() => {
    return createAvatar(micah, {
      size: 100,
      seed: player.username,
    }).toDataUriSync();
  }, []);

  // useEffect(() => {
  //   setVotes(player.votes || 0)
  // }, [player.votes])

  // vote to kill
  const voteForUser = (username, gameID) => {
    const options = {
      method: "put",
      url: `http://localhost:3000/api/voteToKill/${gameID}`,
      data: { gameID: gameID, username: username,}
    }
    axios(options)
    .then(res => {
      return res.data
    })
    .catch((err) => {
      console.log(err, 'didnae vote good')
    })
  }

  // unvote to kill
  const unvoteForUser = (username, gameID) => {
    const options = {
      method: "put",
      url: `http://localhost:3000/api/unvoteToKill/${gameID}`,
      data: {username: username, gameID: gameID}
    }
    axios(options)
    .then(res => {
      return res.data
    })
    .catch((err) => {
      console.log(err, 'didnae vote good')
    })
  }

  useEffect(() => { //wcm @ gametime
    // console.log('change in this avatar player: ', player.username, 'votes', player.votes)
    setVotes(player.votes);
  }, [player])

  useEffect(() => {
    // setVotes(player.votes);
    setCanSelect(thisPlayerCanSelect);
    // if (!thisPlayerCanSelect) {
    //   setCanHover(false);
    // }
  }, [thisPlayerCanSelect]);

  // if player is not currently selected, set style to unselected
  useEffect(() => {
    if (selected !== player) {
      setStyle(playerStyle)
      // unvoteForUser(player.username, null, gameID)
    }
  }, [isSelected]);

  // when selected or player change, set state to whether this is the current selection
  useEffect(() => {
    if(selected === player) console.log('selected: ', player)
      setIsSelected(selected === player);
  }, [selected, player])
  // useEffect(() => {
  // }, [selected])
  // useEffect(() => {
  //   // console.log('isSelected:', player.username, isSelected)
  //   // console.log('isSelected:', player.username, isSelected)
  //   // console.log('isSelectedLagFrame:', player.username, isSelectedLagFrame)
  //   if (isSelected && !isSelectedLagFrame) {
  //     //select
  //   } else if (isSelectedLagFrame && !isSelected) {
  //     //unselect
  //     // unvoteForUser(player.username, gameID)
  //   }
  //   setIsSelectedLagFrame(isSelected)
  // }, [isSelected])
  // useEffect(() => {
  //   // console.log('isSelected:', player.username, isSelected)
  //   // console.log('isSelectedLagFrame:', player.username, isSelectedLagFrame)
  // }, [isSelectedLagFrame])

  // if player is alive and not currently selected, highlight on hover
  const handleHoverIn = function(e) {
    if (!isSelected && canHover) {
      setStyle(playerStyleHover)
    }
  }
  const handleHoverOut = function(e) {
    if (!isSelected && canHover) {
      setStyle(playerStyle)
    }
  }

  // if current selection:
  //   set style to normal style,
  //   set selected to null
  const select = async function () {
    setStyle(playerStyleHover);
    const newLastSelected = selected;
    console.log(gameID)
    await voteForUser(player.username, gameID);
    setSelected(player);
    setLastSelected(selected);
    console.log("voted for ", player.username);
  };

  // if not the current selection:
  //   set style to hover style,
  //   set selected and last selected to player
  const unselect =  function() {
    setStyle(playerStyle)
    setSelected(null)
    // await unvoteForUser(player.username, null, gameID)
  }
  // if selected: unselect
  // else: select
  const handleSelect = async function(e) {
    console.log('clicked!')
    if(!canSelect) {
      console.log(player.isAlive)
      console.log(canSelect)
      return;
    }
    if (isSelected) {
      await unselect();
    } else {
      await select();
    }
  }

  // useEffect(() => {
  //   console.log(selected)
  // }, [selected])

  return (
    <div style={style} onMouseOver={handleHoverIn} onMouseLeave={handleHoverOut} onClick={handleSelect}>
      <div style={{position: 'relative'}} >{player.isAlive && votes > 0 ? <div style={voteStyle}>{votes}</div> : null}</div>
        {player.isAlive ?
          <Image src={avatar} alt="Avatar" width="100" height="100" /> :
          <Image className="dead" src='/2869384.png' alt="tombstone" width="100" height="100" />}
      <small>{player.username}</small>
    </div>
  )
}

export default Avatar
