# Flatstick
Flatstick combines publicly available USGS LiDAR elevation data and OpenStreetMap based golf course maps to determine putting biases and errors, allowing golfers to gain detailed analytics on every part of their putting game.

## What It Does
Flatstick lets golfers:

* Analyze real golf greens using elevation data
* Calculate slope and break between a ball and target
* Track putting performance, including make percentage, miss direction, distance, and slope
* Compare performance across putters and grips
* Share rounds, follow friends, like/comment on results, and compare performance
* Build long-term putting statistics and identify weaknesses
  
## How the Terrain Analysis Works
The core of Flatstick is its ability to turn publicly available elevation data into a usable model of a golf green.
Golf Course
     │
     ▼
Course / Green Geometry
     │
     ▼
USGS LiDAR Elevation Data
     │
     ▼
Elevation Samples
     │
     ▼
Terrain / Slope Model
     │
     ▼
Physics-Based Putt Simulation
     │
     ▼
Predicted Break + Roll

USGS 3DEP LiDAR provides elevation measurements across the green. Flatstick samples this terrain and uses the resulting elevation surface to determine the slope and direction of gravity acting on the ball. This allows the app to determine where you should have aimed versus where you did, and can determine any weaknesses in reading greens.

## Why It's Different
Most golf apps primarily provide GPS distances, score tracking, or manually entered putting information.
Flatstick focuses specifically on the physical behavior of the ball on the green. It provides another dimension of data, as traditional golf apps neglect green data.

### Putting Analytics
The app tracks variables such as:
* Putting distance
* Slope
* Make percentage
* Miss direction / bias
* Putting performance by distance
* Putter
* Grip
* Round-to-round performance

This allows golfers to identify patterns that are difficult to see from score alone.
### For example:
Do I consistently miss left on breaking putts? Does my make percentage change significantly with slope or distance? Which putter or grip performs best for me?
