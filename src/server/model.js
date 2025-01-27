import db from "./db.js";
const userDatabase = require("./userdatabase.js");
const mongoose = require("mongoose");

const model = {
  getChickens: async () => {
    return "chickens";
  },
  getGameState: async (gameID) => {
    try {
      const gameState = await db.GameState.findOne({ gameID: gameID });
      return gameState;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },
  createGame: async (gameID, users, phase) => {
    console.log('creating game...')
    const existingGame = await db.GameState.findOne({gameID: gameID})

    if (existingGame) {
      throw new Error('A game with the provided gameID already exists')
      return
    }
    try {
      const gameState = new db.GameState({
        gameID: gameID,
        users: users,
        phase: phase,
      });
      await gameState.save();
      // console.log(gameState, '------GAMESTATE IN MODEL-------')
      console.log(`game ${gameID} successfully created! `)
      await db.Lobby.findOneAndUpdate({ gameID: gameID }, { hasStarted: true })
      return gameState;
    } catch (error) {
      console.error(error);
      throw error;
      console.error("SERVER ERROR: ", error.response.data.error);
    }
  },
  createLobby: async (gameID, user) => {

    let newLobby = new db.Lobby({
      gameID: gameID,
      users: [{
        username: user,
        role: 'villager'
      }]

    })
    return newLobby.save()
  },
  updateLobby: async (gameID, user) => {
    let newUser = {
      username: user,
      rank: 1,
      role: `villager`,
    };
    return db.Lobby.findOneAndUpdate(
      { gameID: gameID },
      { $push: { users: newUser } },
      { new: true }
    );
  },
  getLobby: async (gameID) => {
    return db.Lobby.find({ gameID: gameID });
  },
  getMessages: (gameID) => {
    return db.Message.find({ gameID: gameID });
  },
  postMessage: async (gameID, message) => {
    let newMessage = new db.Message({
      gameID: gameID,
      user: message.user,
      body: message.body,
      visibleTo: message.visibleTo,
    });
    await newMessage.save();
    return db.Message.find({ gameID: gameID });
  },

  voteForUser: async(username, previousUsername, gameID) => {
    console.log('in vote for user model')
    try {
      const gameState = await db.GameState.findOne({gameID: gameID})

      if (!gameState) {
        throw new Error("Game not found");
      }

      // if (previousUsername) {
      //   const previousUser = gameState.users.find(user => user.username === previousUsername)
      //   if (previousUser) {
      //     console.log('Previous user found:', previousUser)
      //     if (previousUser.votes > 0) {
      //       previousUser.votes -= 1
      //     }
      //   } else {
      //     console.log('Previous user not found:', previousUsername)
      //   }
      // }

      const user = gameState.users.find((user) => user.username === username);
      // const user = gameState.users.find({username:username});
      if (!user) {
        console.log("User not found:", username);
        throw new Error("User not found");
      }
      user.votes += 1;
      // console.log('User votes updated:', user)
      await gameState.save();
      // console.log(gameState, '-----GAMESTATE IN MODEL-----')
      return gameState;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },
  unvoteForUser: async(username, previousUsername, gameID) => {
    try {
      const gameState = await db.GameState.findOne({gameID: gameID})

      if (!gameState) {
        throw new Error("Game not found");
      }

      const user = gameState.users.find((user) => user.username === username);
      // const user = gameState.users.find({username:username});
      if (!user) {
        console.log("User not found:", username);
        throw new Error("User not found");
      }

      user.votes -= 1;
      // console.log('User votes updated:', user)
      await gameState.save();
      return gameState;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  resetVotes: async (gameID) => {
     console.log(gameID, 'RESET VOTES')
    try {
      const gameState = await db.GameState.findOne({ gameID: gameID });
      // console.log('Game state before resetting votes:', gameState);

      if (!gameState) {
        throw new Error("Game not found");
      }

      gameState.users.forEach((user) => {
        // console.log('User before resetting votes:', user);
        user.votes = 0;
        // console.log('User after resetting votes:', user);
      });

      await gameState.save();
      // console.log('Game state after resetting votes:', gameState);
      return gameState;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  killPlayer: async(gameID, username) => {
    try {
      const gameState = await db.GameState.findOne({ gameID })

      if (!gameState) {
        throw new Error('Game not found')
      }

      const user = gameState.users.find(user => user.username === username)

      if (!user) {
        throw new Error('User not found')
      }

      user.isAlive = false;

      await gameState.save()
      return gameState
    } catch (error) {
      console.error(error)
      throw error
    }
  }

}


export default model;
