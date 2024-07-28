import React, { useState, useEffect,useRef } from "react";
import "./index.css";

let audioCtx = null;

const playNote = (freq) => {
  if (audioCtx == null) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  const duration = 0.1;
  const oscillator = audioCtx.createOscillator();
  oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime);
  const gainNode = audioCtx.createGain();
  gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  oscillator.start(audioCtx.currentTime);
  oscillator.stop(audioCtx.currentTime + duration);
};

export default function SortingContainer() {
  const [array, setArray] = useState([]);
  const [copyarray,setcopyarray]=useState([]);
  const [showBars, setShowBars] = useState(false);
  const [isSorting, setIsSorting] = useState(false);
  const [swaps, setSwaps] = useState([]);
  const [sortedArray, setSortedArray] = useState([]);
  const [currentSwap, setCurrentSwap] = useState([]);
  const [sortAlgorithm, setSortAlgorithm] = useState(null);
  const [sortSpeed, setSortSpeed] = useState(200);
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [formatedtime,setFormattedTime]=useState(0);
  const intervalRef = useRef(null);
  const n = 153;
 
  const startProcess = () => {
    const start = new Date();
    setStartTime(start);
    setElapsedTime(0);

    intervalRef.current = setInterval(() => {
        const now = new Date();
        const elapsed = now - start;
        setElapsedTime(elapsed);
        setFormattedTime(formatTime(elapsed));
      }, 100); 
  };

  const endProcess = () => {
    clearInterval(intervalRef.current);
  };

  useEffect(() => {
    return () => clearInterval(intervalRef.current); 
  }, []);

  const formatTime = (milliseconds) => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const remainingMilliseconds = milliseconds % 1000;

    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}.${remainingMilliseconds}`;
  };


  useEffect(() => {
    if (swaps.length === 0 || !isSorting) return;

    const timeout = setTimeout(() => {
      let tempArray = [...array];
      const [i, j] = swaps[0];
      let temp = tempArray[i];
      tempArray[i] = tempArray[j];
      tempArray[j] = temp;
      setArray(tempArray);
      setCurrentSwap([i, j]);
      setSwaps(swaps.slice(1));
      playNote(440 + (tempArray[i] + tempArray[j]) * 220); // Play a note based on the swapped values
    }, sortSpeed);

    return () => clearTimeout(timeout);
  }, [swaps, array, isSorting, sortSpeed]);
  useEffect(()=>{
    init();
  },[])
  useEffect(() => {
    if (swaps.length === 0 && isSorting) {
      setArray(sortedArray);
      setIsSorting(false);
      endProcess();
      setCurrentSwap([]);
    }
  }, [swaps, sortedArray, isSorting]);

  const init = () => {
    const newArray = [];
    for (let i = 0; i < n; i++) {
      newArray.push(Math.random());
    }
    setArray(newArray);
    setcopyarray(newArray);
    setShowBars(true);
    setIsSorting(false);
    setSwaps([]);
    setSortedArray([]);
    setCurrentSwap([]);
  };
  const bubbleSort = (arr) => {
    let n = arr.length;
    let swapped;
    const newArray = [...arr];
    const swapOperations = [];

    for (let i = 0; i < n; i++) {
      swapped = false;
      for (let j = 0; j < n - 1 - i; j++) {
        if (newArray[j] > newArray[j + 1]) {
          swapOperations.push([j, j + 1]);
          let temp = newArray[j];
          newArray[j] = newArray[j + 1];
          newArray[j + 1] = temp;
          swapped = true;
        }
      }
      if (!swapped) {
        break;
      }
    }

    return { swapOperations, sortedArray: newArray };
  };

  const selectionSort = (arr) => {
    const swapOperations = [];
    const newArray = [...arr];

    for (let i = 0; i < newArray.length - 1; i++) {
      let minIndex = i;
      for (let j = i + 1; j < newArray.length; j++) {
        if (newArray[j] < newArray[minIndex]) {
          minIndex = j;
        }
      }
      if (minIndex !== i) {
        swapOperations.push([i, minIndex]);
        [newArray[i], newArray[minIndex]] = [newArray[minIndex], newArray[i]];
      }
    }
    return { swapOperations, sortedArray: newArray };
  };

  const quickSort = (arr) => {
    const swapOperations = [];
    const newArray = [...arr];

    const partition = (low, high) => {
      const pivot = newArray[high];
      let i = low - 1;
      for (let j = low; j < high; j++) {
        if (newArray[j] < pivot) {
          i++;
          swapOperations.push([i, j]);
          [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
      }
      swapOperations.push([i + 1, high]);
      [newArray[i + 1], newArray[high]] = [newArray[high], newArray[i + 1]];
      return i + 1;
    };

    const quickSortHelper = (low, high) => {
      if (low < high) {
        const pi = partition(low, high);
        quickSortHelper(low, pi - 1);
        quickSortHelper(pi + 1, high);
      }
    };

    quickSortHelper(0, newArray.length - 1);
    return { swapOperations, sortedArray: newArray };
  };

  const mergeSort = (arr) => {
    const swapOperations = [];
    const newArray = [...arr];

    const merge = (left, right, startIdx) => {
      let result = [],
        i = 0,
        j = 0;
      while (i < left.length && j < right.length) {
        if (left[i] < right[j]) {
          result.push(left[i]);
          i++;
        } else {
          result.push(right[j]);
          j++;
        }
      }
      result = result.concat(left.slice(i)).concat(right.slice(j));

      // Update the original array and log swap operations
      for (let k = 0; k < result.length; k++) {
        swapOperations.push([startIdx + k, result[k]]);
        newArray[startIdx + k] = result[k];
      }
      return result;
    };

    const mergeSortHelper = (arr, startIdx) => {
      if (arr.length < 2) return arr;
      const middle = Math.floor(arr.length / 2);
      const left = arr.slice(0, middle);
      const right = arr.slice(middle);
      const sortedLeft = mergeSortHelper(left, startIdx);
      const sortedRight = mergeSortHelper(right, startIdx + middle);
      return merge(sortedLeft, sortedRight, startIdx);
    };

    mergeSortHelper(newArray, 0);

    return { swapOperations, sortedArray: newArray };
  };

  const insertionSort = (arr) => {
    const swapOperations = [];
    const newArray = [...arr];

    for (let i = 1; i < newArray.length; i++) {
      let j = i;
      while (j > 0 && newArray[j] < newArray[j - 1]) {
        swapOperations.push([j, j - 1]);
        [newArray[j], newArray[j - 1]] = [newArray[j - 1], newArray[j]];
        j--;
      }
    }
    return { swapOperations, sortedArray: newArray };
  };

  const heapSort = (arr) => {
    const swapOperations = [];
    const newArray = [...arr];

    const heapify = (n, i) => {
      let largest = i;
      const left = 2 * i + 1;
      const right = 2 * i + 2;

      if (left < n && newArray[left] > newArray[largest]) {
        largest = left;
      }

      if (right < n && newArray[right] > newArray[largest]) {
        largest = right;
      }

      if (largest !== i) {
        swapOperations.push([i, largest]);
        [newArray[i], newArray[largest]] = [newArray[largest], newArray[i]];
        heapify(n, largest);
      }
    };

    for (let i = Math.floor(newArray.length / 2) - 1; i >= 0; i--) {
      heapify(newArray.length, i);
    }

    for (let i = newArray.length - 1; i > 0; i--) {
      swapOperations.push([0, i]);
      [newArray[0], newArray[i]] = [newArray[i], newArray[0]];
      heapify(i, 0);
    }

    return { swapOperations, sortedArray: newArray };
  };

  const playSort = (algorithm) => {
    if (isSorting) return;
    setIsSorting(true);
    let result;
    switch (algorithm) {
      case "bubbleSort":
        result = bubbleSort(array);
        break;
      case "selectionSort":
        result = selectionSort(array);
        break;
      case "insertionSort":
        result = insertionSort(array);
        break;
      case "quickSort":
        result = quickSort(array);
        break;
      case "mergeSort":
        result = mergeSort(array);
        break;
      case "heapSort":
        result = heapSort(array);
        break;
      default:
        result = bubbleSort(array);
        break;
    }
    setSwaps(result.swapOperations);
    setSortedArray(result.sortedArray);
  };
  const handleChange = (event) => {
    setSortAlgorithm(event.target.value);
  };
const ResetButton=()=>{
    init()  
    endProcess()
    setStartTime(0)
    setFormattedTime(0);
    setElapsedTime(0);
}
const StartButton=()=>{
    startProcess()
    playSort(sortAlgorithm)
}
  return (
    <>
      <div className="heading">
        <h1>Sorting Visualizer</h1>
      </div>
      <div className="container">
        {showBars && (
          <div className="barcontainer">
            {array.map((value, index) => (
              <div
                key={index}
                className="bar"
                style={{
                  height: `${value * 100}%`,
                  minHeight: "10px",
                  backgroundColor: currentSwap.includes(index) ? "red" : "",
                }}
              ></div>
            ))}
          </div>
        )}
      </div>
      <div className="extrafeatures">
      <div>
          <select value={sortAlgorithm} onChange={handleChange}>
            <option value="bubbleSort">Bubble Sort</option>
            <option value="selectionSort">Selection Sort</option>
            <option value="insertionSort">Insertion Sort</option>
            <option value="quickSort">Quick Sort</option>
            <option value="mergeSort">Merge Sort</option>
            <option value="heapSort">Heap Sort</option>
          </select>
          <button onClick={StartButton}>Start</button>
          <button onClick={ResetButton}>Reset</button>
        </div>
        <button>{formatedtime}</button>
        <div className="speed-buttons">
          <button onClick={() => setSortSpeed(20)}>Fast</button>
          <button onClick={() => setSortSpeed(200)}>Medium</button>
          <button onClick={() => setSortSpeed(500)}>Slow</button>
        </div>
        </div>
        <div className="databutton">
        <button onClick={()=>{!isSorting?setArray(copyarray):''}}>Same Data</button>
        </div>
    </>
  );
}
