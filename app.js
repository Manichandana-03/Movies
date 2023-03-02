const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "moviesData.db");
let db = null;
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server running at http://localhost:3000");
    });
  } catch (e) {
    console.log(`Error DB:${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const convertDBObjectToResponseObject = (dbObject) => {
  return {
    movieName: dbObject.movie_name,
  };
};
//API 1
app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `
     SELECT * FROM movie;`;
  const moviesList = await db.all(getMoviesQuery);
  response.send(
    moviesList.map((eachMovie) => convertDBObjectToResponseObject(eachMovie))
  );
});
//API 2
app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const addMovieQuery = `
INSERT INTO
 movie 
 (director_id,movie_name,lead_actor)
VALUES(
    ${directorId},
    '${movieName}',
    '${leadActor}'
);`;
  const dbResponse = await db.run(addMovieQuery);
  const movie = dbResponse.lastID;
  response.send("Movie Successfully Added");
});

const dBObjToResponseObj = (dbObject) => {
  return {
    movieID: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};
//API 3
app.get("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `
        SELECT 
        *
         FROM
         movie
          WHERE 
          movie_id = ${movieId};`;
  const movieGot = await db.get(getMovieQuery);
  response.send(dBObjToResponseObj(movieGot));
});
//API 4
app.put("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;
  console.log(movieDetails);
  const { directorId, movieName, leadActor } = movieDetails;
  const updateMovieQuery = `
       UPDATE
        movie
         SET(director_id,movie_name,lead_actor)
       VALUES(
        ${directorId},
        '${movieName}',
        '${leadActor}'
        )
        WHERE 
        movie_id = ${movieId};`;
  await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});
//API 5
app.delete("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `
    DELETE FROM
      movie
    WHERE
      movie_id = ${movieId};`;
  await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});

const convertDBObjToResponseObj = (dbObject) => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  };
};
//API 6
app.get("/directors/", async (request, response) => {
  const getDirectorsQuery = `
 SELECT * FROM director;`;
  const directorsList = await db.all(getDirectorsQuery);
  response.send(
    directorsList.map((eachDirector) => convertDBObjToResponseObj(eachDirector))
  );
});
//API 7
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getDirectorMoviesQuery = `
    SELECT 
    movie_name 
    FROM 
    movie
     WHERE 
     director_id = ${directorId};`;
  const moviesArray = await db.all(getDirectorMoviesQuery);
  response.send(moviesArray);
});

module.exports = app;
