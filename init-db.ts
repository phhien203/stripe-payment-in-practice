
import {COURSES, findLessonsForCourse} from './db-data';

import * as firebase from 'firebase';

var config = {
    // TODO copy-paste here your own config, taken from the Firebase dashboard
  apiKey: "AIzaSyAYaALjlQK9yaz7III6YpeAo69X0suFmUE",
  authDomain: "stripe-course-24fec.firebaseapp.com",
  databaseURL: "https://stripe-course-24fec.firebaseio.com",
  projectId: "stripe-course-24fec",
  storageBucket: "stripe-course-24fec.appspot.com",
  messagingSenderId: "538193877887",
  appId: "1:538193877887:web:66ba2061ce100f9e0c584a"
};

console.log("Uploading data to the database with the following config:\n");

console.log(JSON.stringify(config));

console.log("\n\n\n\nMake sure that this is your own database, so that you have write access to it.\n\n\n");

firebase.initializeApp(config);

const db = firebase.firestore();

async function uploadData() {

  var batch = db.batch();

  const courses = db.collection('courses');


  Object.values(COURSES)
    .sort((c1:any, c2:any) => c1.seqNo - c2.seqNo)
    .forEach(async (course:any) => {

      const newCourse = removeId(course);

      const courseRef = await courses.add(newCourse);

      const lessons = courseRef.collection("lessons");

      const courseLessons = findLessonsForCourse(course.id);

      //console.log(`Adding ${courseLessons.length} lessons to ${course.description}`);

      courseLessons.forEach(async lesson => {

        const newLesson = removeId(lesson);

        await lessons.add(newLesson);

      });

    });

  return batch.commit();
}


function removeId(data:any) {

  const newData: any = {...data};

  delete newData.id;

  return newData;
}


uploadData()
  .then(() => {
    console.log("Writing data, exiting in 10 seconds ...\n\n");

    setTimeout(() => {

      console.log("\n\n\nData Upload Completed.\n\n\n");
      process.exit(0);

    }, 10000);

  })
  .catch(err => {
    console.log("Data upload failed, reason:", err, '\n\n\n');
    process.exit(-1);
  });


