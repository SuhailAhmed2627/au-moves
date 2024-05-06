import studentData from "../au_moves.students.json" assert { type: "json" };

const times = [8, 10, 12, 13, 15, 17, 19];

const ids = studentData.map((student) => student._id["$oid"]);

const time = new Date();
time.setDate(time.getDate() + 2);
time.setHours(8);
time.setMinutes(0);
time.setSeconds(0);
time.setMilliseconds(0);

const createRides = async (id, hour, toUni) => {
  const time = new Date();
  time.setDate(time.getDate() + 1);
  time.setHours(hour);
  time.setMinutes(0);
  time.setSeconds(0);
  time.setMilliseconds(0);
  const res = await fetch("http://localhost:3000/ride/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      studentId: id,
      time: time.toISOString(),
      toUni: toUni,
    }),
  });

  if (res.status === 200) {
    console.log("Ride created");
  } else {
    console.log("Failed to create ride");
  }
};

ids.slice(0, 20).forEach(async (id, index) => {
  createRides(id, times[0], true);
});
ids.slice(0, 10).forEach(async (id, index) => {
  createRides(id, times[3], false);
});
ids.slice(10, 20).forEach(async (id, index) => {
  createRides(id, times[4], false);
});

ids.slice(20, 30).forEach(async (id, index) => {
  createRides(id, times[1], true);
  createRides(id, times[5], false);
});

ids.slice(30, 40).forEach(async (id, index) => {
  createRides(id, times[2], true);
  createRides(id, times[6], false);
});
