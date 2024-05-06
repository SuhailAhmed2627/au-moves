import clustersKmeans from "@turf/clusters-kmeans"; // Library to cluster points using K-Means algorithm
import { point, featureCollection } from "@turf/turf"; // Library to create points and feature collections

const MIN_ELEMENTS_IN_CLUSTER = 5;
const MAX_ITERATIONS = 10;

/**
 * A Student's Location Data
 * @typedef {Object} StudentLocation
 * @property {string} id - Student's ID
 * @property {string} latitude - Student's latitude
 * @property {string} longitude - Student's longitude
 */

/**
 * Get clusters of students based on their location
 * @param {StudentLocation[]} studentLocations
 * @param {number} numberOfClusters
 * @returns {StudentLocation[][]} - Clusters of students
 */
const getClusters = (studentLocations, numberOfClusters) => {
  /** @type {StudentLocation[][]} */
  const clusters = new Array(); // Array of clusters

  // Convert student locations to vectors
  // Vectors are points in a 2D space
  // Each vector represents a student's location
  // Each vector has a lat and lng property
  const vectors = featureCollection(
    studentLocations.map(
      ({ latitude, longitude }) => new point([latitude, longitude]),
    ),
  );

  const clusteredPoints = clustersKmeans(vectors, {
    numberOfClusters: numberOfClusters,
  });

  clusteredPoints.features.forEach((clusteredPoint, index) => {
    const clusterIndex = clusteredPoint.properties.cluster;
    if (!clusters[clusterIndex]) {
      clusters[clusterIndex] = [];
    }
    clusters[clusterIndex].push(studentLocations[index]);
  });
  return clusters;
};

const iterativeClustering = (studentLocations, numberOfClusters) => {
  let clusterCount = numberOfClusters;
  let clusters = getClusters(studentLocations, clusterCount);
  let iterations = 1;

  while (clusters.some((cluster) => cluster.length < MIN_ELEMENTS_IN_CLUSTER)) {
    console.log(`Iteration ${iterations}`);
    if (iterations > MAX_ITERATIONS) {
      throw new Error("Maximum iterations reached");
    }
    clusterCount--;
    console.log(`Reducing cluster count to ${clusterCount}`);
    clusters = getClusters(studentLocations, clusterCount);
    iterations++;
  }
  return clusters;
};

const clusterWithMinimumElements = (studentLocations, minElementsInCluster) => {
  // Get clusters of students based on their location using K-Means algorithm but with a minimum number of elements in each cluster

  // A lot of math here
  // I don't understand it either
  // Minimum number of elements in cluster can be 1
  // Maximum number of elements in cluster can be the number of students
  for (let i = studentLocations.length; i >= 1; i--) {
    const clusters = getClusters(studentLocations, i);
    if (clusters.every((cluster) => cluster.length >= minElementsInCluster)) {
      return clusters;
    }
  }
};

export { iterativeClustering, clusterWithMinimumElements };
