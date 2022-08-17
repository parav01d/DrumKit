import React, { useEffect, useRef, useState } from 'react';
import fft from "fft-js";
import { debounceTime, delay, interval, reduce,  Subject, takeUntil, timer } from 'rxjs';

const HI_HAT = "HI_HAT";
const HI_HAT_CLOSED = "HI_HAT_CLOSED";
const SNARE = "SNARE";
const BASS = "BASS";

const FREQUENCY_TOLERANCE = 3;
const MELODIES = {
  PUNK_1: {
    HI_HAT:        "----------------",
    HI_HAT_CLOSED: "x---x---x---x---",
    SNARE:         "----x-------x---",
    BASS:          "x---------x-----",
    SPEED: 202,
    TACT: () => 4/4,
    NAME: "Punk 1"
  },
  PUNK_2: {
    HI_HAT:        "----------------",
    HI_HAT_CLOSED: "x---x---x---x---",
    SNARE:         "----x-------x---",
    BASS:          "x-----x---x-----",
    SPEED: 202,
    TACT: () => 4/4,
    NAME: "Punk 2"
  },
  PUNK_3: {
    HI_HAT:        "----------------",
    HI_HAT_CLOSED: "x---x---x---x---",
    SNARE:         "----x-------x---",
    BASS:          "--x---x-x-------",
    SPEED: 202,
    TACT: () => 4/4,
    NAME: "Punk 3"
  },
  PUNK_4: {
    HI_HAT:        "----------------",
    HI_HAT_CLOSED: "x---x---x---x---",
    SNARE:         "----x-------x---",
    BASS:          "x-x---x-x-x-----",
    SPEED: 202,
    TACT: () => 4/4,
    NAME: "Punk 4"
  },
  ROCK_1: {
    HI_HAT:        "----------------",
    HI_HAT_CLOSED: "x---x---x---x---",
    SNARE:         "----x-------x---",
    BASS:          "x-------x-------",
    SPEED: 132,
    TACT: () => 4/4,
    NAME: "Rock 1"
  },
  ROCK_2: {
    HI_HAT:        "----------------",
    HI_HAT_CLOSED: "x---x---x---x---",
    SNARE:         "----x-------x---",
    BASS:          "x---x---x---x---",
    SPEED: 132,
    TACT: () => 4/4,
    NAME: "Rock 2"
  },
  ROCK_3: {
    HI_HAT:        "----------------",
    HI_HAT_CLOSED: "x---x---x---x---",
    SNARE:         "----x-------x---",
    BASS:          "x-----x-x-------",
    SPEED: 132,
    TACT: () => 4/4,
    NAME: "Rock 3"
  },
  ROCK_4: {
    HI_HAT:        "----------------",
    HI_HAT_CLOSED: "x---x---x---x---",
    SNARE:         "----x-------x---",
    BASS:          "x-------x-x-----",
    SPEED: 132,
    TACT: () => 4/4,
    NAME: "Rock 4"
  },
  ROCK_8THS_1: {
    HI_HAT:        "----------------",
    HI_HAT_CLOSED: "x-x-x-x-x-x-x-x-",
    SNARE:         "----x-------x---",
    BASS:          "x-------x-----x-",
    SPEED: 132,
    TACT: () => 4/4,
    NAME: "Rock 8ths 1"
  },
  ROCK_8THS_2: {
    HI_HAT:        "----------------",
    HI_HAT_CLOSED: "x-x-x-x-x-x-x-x-",
    SNARE:         "----x-------x---",
    BASS:          "x-x-----x-x-----",
    SPEED: 132,
    TACT: () => 4/4,
    NAME: "Rock 8ths 2"
  },
  ROCK_8THS_3: {
    HI_HAT:        "----------------",
    HI_HAT_CLOSED: "x-x-x-x-x-x-x-x-",
    SNARE:         "----x-------x---",
    BASS:          "x-x---x-x-------",
    SPEED: 132,
    TACT: () => 4/4,
    NAME: "Rock 8ths 3"
  },
  ROCK_8THS_4: {
    HI_HAT:        "----------------",
    HI_HAT_CLOSED: "x-x-x-x-x-x-x-x-",
    SNARE:         "----x-------x---",
    BASS:          "x-x---x---x-----",
    SPEED: 132,
    TACT: () => 4/4,
    NAME: "Rock 8ths 4"
  },
  ROCK_SLOW_16THS_1: {
    HI_HAT:        "----------------",
    HI_HAT_CLOSED: "xxxxxxxxxxxxxxxx",
    SNARE:         "----x-------x---",
    BASS:          "x-----x-x-------",
    SPEED: 80,
    TACT: () => 4/4,
    NAME: "Rock Slow 16ths 1"
  },
  ROCK_SLOW_16THS_2: {
    HI_HAT:        "----------------",
    HI_HAT_CLOSED: "xxxxxxxxxxxxxxxx",
    SNARE:         "----x-------x---",
    BASS:          "x------xx-------",
    SPEED: 80,
    TACT: () => 4/4,
    NAME: "Rock Slow 16ths 2"
  },
  ROCK_SLOW_16THS_3: {
    HI_HAT:        "----------------",
    HI_HAT_CLOSED: "xxxxxxxxxxxxxxxx",
    SNARE:         "----x-------x---",
    BASS:          "x------xx-x-----",
    SPEED: 80,
    TACT: () => 4/4,
    NAME: "Rock Slow 16ths 3"
  },
  ROCK_SLOW_16THS_4: {
    HI_HAT:        "----------------",
    HI_HAT_CLOSED: "xxxxxxxxxxxxxxxx",
    SNARE:         "----x-------x---",
    BASS:          "x------xx-----x-",
    SPEED: 80,
    TACT: () => 4/4,
    NAME: "Rock Slow 16ths 4"
  },
  ROCK_SLOW_12_8_1: {
    HI_HAT:        "------------",
    HI_HAT_CLOSED: "xxxxxxxxxxxx",
    SNARE:         "---x-----x--",
    BASS:          "x-----x-----",
    SPEED: 60,
    TACT: () => 12/8,
    NAME: "Rock Slow 12/8 1"
  },
  ROCK_SLOW_12_8_2: {
    HI_HAT:        "------------",
    HI_HAT_CLOSED: "xxxxxxxxxxxx",
    SNARE:         "---x-----x--",
    BASS:          "x----xx-----",
    SPEED: 60,
    TACT: () => 12/8,
    NAME: "Rock Slow 12/8 2"
  },
  ROCK_SLOW_12_8_3: {
    HI_HAT:        "------------",
    HI_HAT_CLOSED: "xxxxxxxxxxxx",
    SNARE:         "---x-----x--",
    BASS:          "x----xx----x",
    SPEED: 60,
    TACT: () => 12/8,
    NAME: "Rock Slow 12/8 3"
  },
  ROCK_SLOW_12_8_4: {
    HI_HAT:        "------------",
    HI_HAT_CLOSED: "xxxxxxxxxxxx",
    SNARE:         "---x-----x--",
    BASS:          "x-x--xx-----",
    SPEED: 60,
    TACT: () => 12/8,
    NAME: "Rock Slow 12/8 4"
  }
}


function App() {

  const raceRef = useRef(null)
  const audioInput$ = useRef(new Subject()).current;

  const matchSnare$ = useRef(new Subject()).current;
  const matchHiHat$ = useRef(new Subject()).current;
  const matchHiHatClosed$ = useRef(new Subject()).current;
  const matchBass$ = useRef(new Subject()).current;

  const scoreSnare$ = useRef(new Subject()).current;
  const scoreHiHat$ = useRef(new Subject()).current;
  const scoreHiHatClosed$ = useRef(new Subject()).current;
  const scoreBass$ = useRef(new Subject()).current;
  
  const [points, setPoints] = useState(0);

  const [melody, setMelody] = useState("PUNK_1");

  const [raceHeight, setRaceHeight] = useState(0)

  const [isRecording, setIsRecording] = useState(false);
  const [isRunning, setIsRunning] = useState(true);
  const [bpm, setBpm] = useState(202);
  const [withMetronome, setWithMetronome] = useState(false);

  const [snareFreq, setSnareFreq] = useState(0);
  const [hiHatFreq, setHiHatFreq] = useState(0);
  const [hiHatClosedFreq, setHiHatClosedFreq] = useState(0);
  const [bassFreq, setBassFreq] = useState(0);

  const [animation, setAnimation] = useState({
    0: [],
    1: [],
    2: [],
    3: [],
    4: [],
    5: [],
    6: [],
    7: [],
    8: [],
    9: [],
    10: [],
    11: [],
    12: [],
    13: [],
    14: [],
    15: []
  });
  const [matchedInstruments, setMatchedInstruments] = useState({
    [HI_HAT]: false,
    [HI_HAT_CLOSED]: false,
    [SNARE]: false,
    [BASS]: false
  })
  const [scoredInstruments, setScoredInstruments] = useState({
    [HI_HAT]: false,
    [HI_HAT_CLOSED]: false,
    [SNARE]: false,
    [BASS]: false
  })


  const [step, setStep] = useState(0);

  useEffect(()=> {
    if(withMetronome && step%4 === 0) {
      beep();
    }
  })

  useEffect(() => {
    var additionalPoints = 0

    if(matchedInstruments[HI_HAT] && MELODIES[melody][HI_HAT][step] === "x") {
      additionalPoints = additionalPoints + 50
      scoreHiHat$.next(HI_HAT)
    }
    if(matchedInstruments[HI_HAT_CLOSED] && MELODIES[melody][HI_HAT_CLOSED][step] === "x") {
      additionalPoints = additionalPoints + 50
      scoreHiHatClosed$.next(HI_HAT_CLOSED)
    }
    if(matchedInstruments[SNARE] && MELODIES[melody][SNARE][step] === "x") {
      additionalPoints = additionalPoints + 50
      scoreSnare$.next(SNARE)
    }
    if(matchedInstruments[BASS] && MELODIES[melody][BASS][step] === "x") {
      additionalPoints = additionalPoints + 50
      scoreBass$.next(BASS);
    }
    setPoints((points) => points + additionalPoints);
  }, [step, melody])

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
      const context = new AudioContext();
      const source = context.createMediaStreamSource(stream);
      const processor = context.createScriptProcessor(1024, 1, 1);
      source.connect(processor);
      processor.connect(context.destination);
      processor.addEventListener(
        "audioprocess",
        e => {
            const p = fft.fft(e.inputBuffer.getChannelData(0));
            const frequencies = fft.util.fftFreq(p, 8000);
            const magnitudes = fft.util.fftMag(p); 
  
            const both = frequencies.map( (f, ix) => {
              return {frequency: f, magnitude: magnitudes[ix]};
            });
            audioInput$.next(both);
        })
    })
  }, [audioInput$]);

  useEffect(() => {
    setRaceHeight(raceRef.current.clientHeight)
  }, [])

  useEffect(() => {
    audioInput$.pipe().subscribe((data) => {
        const { frequency, magnitude } = data.reduce((a, c) => {
          if(a.magnitude > c.magnitude) {
            return a;
          }
          return c;
        }, {frequency: 0, magnitude: 0})
        if( frequency > FREQUENCY_TOLERANCE && magnitude > 10){
          if(frequency <= hiHatFreq + FREQUENCY_TOLERANCE && frequency >= hiHatFreq - FREQUENCY_TOLERANCE) {
            matchHiHat$.next(HI_HAT);
          }
          if(frequency <= hiHatClosedFreq + FREQUENCY_TOLERANCE && frequency >= hiHatClosedFreq - FREQUENCY_TOLERANCE) {
            matchHiHatClosed$.next(HI_HAT_CLOSED);
          }
          if(frequency <= snareFreq + FREQUENCY_TOLERANCE && frequency >= snareFreq - FREQUENCY_TOLERANCE) {
            matchSnare$.next(SNARE);
          }
          if(frequency <= bassFreq + FREQUENCY_TOLERANCE && frequency >= bassFreq - FREQUENCY_TOLERANCE) {
            matchBass$.next(BASS);
          }
        }
      });
  }, [bassFreq, snareFreq, hiHatClosedFreq, hiHatFreq])
  
  useEffect(() => {
    scoreHiHatClosed$.subscribe((instrument) => {
      setScoredInstruments((scoredInst) => ({...scoredInst, ...{[instrument]: true} }))
    })
    scoreHiHatClosed$.pipe(delay(60000/bpm/4*MELODIES[melody].TACT()), debounceTime(60000/bpm/4*MELODIES[melody].TACT())).subscribe((instrument) => {
      setScoredInstruments((scoredInst) => ({...scoredInst, ...{[instrument]: false} }))
    })
    scoreHiHat$.subscribe((instrument) => {
      setScoredInstruments((scoredInst) => ({...scoredInst, ...{[instrument]: true} }))
    })
    scoreHiHat$.pipe(delay(60000/bpm/4*MELODIES[melody].TACT()), debounceTime(60000/bpm/4*MELODIES[melody].TACT())).subscribe((instrument) => {
      setScoredInstruments((scoredInst) => ({...scoredInst, ...{[instrument]: false} }))
    })
    scoreSnare$.subscribe((instrument) => {
      setScoredInstruments((scoredInst) => ({...scoredInst, ...{[instrument]: true} }))
    })
    scoreSnare$.pipe(delay(60000/bpm/4*MELODIES[melody].TACT()), debounceTime(60000/bpm/4*MELODIES[melody].TACT())).subscribe((instrument) => {
      setScoredInstruments((scoredInst) => ({...scoredInst, ...{[instrument]: false} }))
    })
    scoreBass$.subscribe((instrument) => {
      setScoredInstruments((scoredInst) => ({...scoredInst, ...{[instrument]: true} }))
    })
    scoreBass$.pipe(delay(60000/bpm/4*MELODIES[melody].TACT()), debounceTime(60000/bpm/4*MELODIES[melody].TACT())).subscribe((instrument) => {
      setScoredInstruments((scoredInst) => ({...scoredInst, ...{[instrument]: false} }))
    })
  }, [bpm, melody])

  useEffect(() => {
    matchHiHatClosed$.subscribe((instrument) => {
      setMatchedInstruments((matchedInst) => ({...matchedInst, ...{[instrument]: true} }))
    })
    matchHiHatClosed$.pipe(delay(60000/bpm/4*MELODIES[melody].TACT()), debounceTime(60000/bpm/4*MELODIES[melody].TACT())).subscribe((instrument) => {
      setMatchedInstruments((matchedInst) => ({...matchedInst, ...{[instrument]: false} }))
    })
    matchHiHat$.subscribe((instrument) => {
      setMatchedInstruments((matchedInst) => ({...matchedInst, ...{[instrument]: true} }))
    })
    matchHiHat$.pipe(delay(60000/bpm/4*MELODIES[melody].TACT()), debounceTime(60000/bpm/4*MELODIES[melody].TACT())).subscribe((instrument) => {
      setMatchedInstruments((matchedInst) => ({...matchedInst, ...{[instrument]: false} }))
    })
    matchSnare$.subscribe((instrument) => {
      setMatchedInstruments((matchedInst) => ({...matchedInst, ...{[instrument]: true} }))
    })
    matchSnare$.pipe(delay(60000/bpm/4*MELODIES[melody].TACT()), debounceTime(60000/bpm/4*MELODIES[melody].TACT())).subscribe((instrument) => {
      setMatchedInstruments((matchedInst) => ({...matchedInst, ...{[instrument]: false} }))
    })
    matchBass$.subscribe((instrument) => {
      setMatchedInstruments((matchedInst) => ({...matchedInst, ...{[instrument]: true} }))
    })
    matchBass$.pipe(delay(60000/bpm/4*MELODIES[melody].TACT()), debounceTime(60000/bpm/4*MELODIES[melody].TACT())).subscribe((instrument) => {
      setMatchedInstruments((matchedInst) => ({...matchedInst, ...{[instrument]: false} }))
    })
  }, [matchHiHatClosed$, matchHiHat$, matchSnare$, matchBass$])

  useEffect(() => {

    const subscription = interval(60000/bpm/4*MELODIES[melody].TACT()).pipe(
      ).subscribe((i) => {
        if(isRunning) {
          const newAnimation = []
          if(MELODIES[melody][SNARE][(i+1)%MELODIES[melody][SNARE].length] === "x") {
            newAnimation.push(SNARE);
          }
          if(MELODIES[melody][HI_HAT][(i+1)%MELODIES[melody][HI_HAT].length] === "x") {
            newAnimation.push(HI_HAT);
          }
          if(MELODIES[melody][HI_HAT_CLOSED][(i+1)%MELODIES[melody][HI_HAT_CLOSED].length] === "x") {
            newAnimation.push(HI_HAT_CLOSED);
          }
          if(MELODIES[melody][BASS][(i+1)%MELODIES[melody][BASS].length] === "x") {
            newAnimation.push(BASS);
          }
          setAnimation((animation) => ({...animation, ...{[(i+1)%MELODIES[melody][BASS].length]: newAnimation}}));
          setStep((i+1)%MELODIES[melody][BASS].length);
        }
    })
    return () => subscription.unsubscribe();
        
  },[bpm, isRunning, melody] )

  const recordInstrument = (instrument) => {
    setIsRecording(true);
    audioInput$.pipe(
      takeUntil(timer(3000)),
      reduce((acc, curr) => {
        const maxMagnitude = curr.reduce((a, c) => {
          if(a.magnitude > c.magnitude) {
            return a;
          }
          return c;
        }, {frequency: 0, magnitude: 0})
        if(maxMagnitude.magnitude > acc.magnitude) {
          return maxMagnitude;
        }
        return acc;
      }, {frequency: 0, magnitude: 0})
      ).subscribe((both) => {
        switch (instrument) {
          case HI_HAT:
            setHiHatFreq(parseInt(both.frequency));
            break;
          case HI_HAT_CLOSED:
            setHiHatClosedFreq(parseInt(both.frequency));
            break;
          case SNARE:
            setSnareFreq(parseInt(both.frequency));
            break;
          case BASS:
            setBassFreq(parseInt(both.frequency));
            break;
          default:
            break;
        }
      setIsRecording(false);
    })
  }

  const beep = () => {
    const snd = new Audio("data:audio/wav;base64,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qJrx4KOQjahZxWbcZgztj2c49nKmkId44S71j0c8eV9yDK6uPRzx5X18eDvjvQ6yKo9ZSS6l//8elePK/Lf//IInrOF/FvDoADYAGBMGb7FtErm5MXMlmPAJQVgWta7Zx2go+8xJ0UiCb8LHHdftWyLJE0QIAIsI+UbXu67dZMjmgDGCGl1H+vpF4NSDckSIkk7Vd+sxEhBQMRU8j/12UIRhzSaUdQ+rQU5kGeFxm+hb1oh6pWWmv3uvmReDl0UnvtapVaIzo1jZbf/pD6ElLqSX+rUmOQNpJFa/r+sa4e/pBlAABoAAAAA3CUgShLdGIxsY7AUABPRrgCABdDuQ5GC7DqPQCgbbJUAoRSUj+NIEig0YfyWUho1VBBBA//uQZB4ABZx5zfMakeAAAAmwAAAAF5F3P0w9GtAAACfAAAAAwLhMDmAYWMgVEG1U0FIGCBgXBXAtfMH10000EEEEEECUBYln03TTTdNBDZopopYvrTTdNa325mImNg3TTPV9q3pmY0xoO6bv3r00y+IDGid/9aaaZTGMuj9mpu9Mpio1dXrr5HERTZSmqU36A3CumzN/9Robv/Xx4v9ijkSRSNLQhAWumap82WRSBUqXStV/YcS+XVLnSS+WLDroqArFkMEsAS+eWmrUzrO0oEmE40RlMZ5+ODIkAyKAGUwZ3mVKmcamcJnMW26MRPgUw6j+LkhyHGVGYjSUUKNpuJUQoOIAyDvEyG8S5yfK6dhZc0Tx1KI/gviKL6qvvFs1+bWtaz58uUNnryq6kt5RzOCkPWlVqVX2a/EEBUdU1KrXLf40GoiiFXK///qpoiDXrOgqDR38JB0bw7SoL+ZB9o1RCkQjQ2CBYZKd/+VJxZRRZlqSkKiws0WFxUyCwsKiMy7hUVFhIaCrNQsKkTIsLivwKKigsj8XYlwt/WKi2N4d//uQRCSAAjURNIHpMZBGYiaQPSYyAAABLAAAAAAAACWAAAAApUF/Mg+0aohSIRobBAsMlO//Kk4soosy1JSFRYWaLC4qZBYWFRGZdwqKiwkNBVmoWFSJkWFxX4FFRQWR+LsS4W/rFRb/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////VEFHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAU291bmRib3kuZGUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMjAwNGh0dHA6Ly93d3cuc291bmRib3kuZGUAAAAAAAAAACU=");  
    snd.play();
}

  const marbleStyle = (isHidden) => ({
    transition: `all ${!isHidden?((60/bpm/4*MELODIES[melody].TACT())*MELODIES[melody][HI_HAT].length):0}s linear`,
    transform: `translate(0px, ${!isHidden?(raceHeight):0}px)`,
    visibility: `${!isHidden ? "visible": "hidden"}`
  });

  const renderMarble = (instrument, renderStep, color) => {
    const isHidden = ((renderStep === 0 && step === MELODIES[melody][HI_HAT].length-1) && (animation[step].indexOf(instrument) >= 0)) 
    || ((renderStep -1 === step) && (animation[renderStep-1].indexOf(instrument) >= 0)) 
    return (
      <div key={`${instrument}_${renderStep}`} style={marbleStyle(isHidden)} className={`shadow-sm shadow-slate-500 rounded-full w-14 h-14 ${color} absolute top-0`}></div>
    )
  }

  const lineStyle = (isHidden) => ({
    transition: `all ${!isHidden?((60/bpm/4*MELODIES[melody].TACT())*MELODIES[melody][HI_HAT].length):0}s linear`,
    transform: `translate(0px, ${!isHidden?(raceHeight):0}px)`,
    visibility: `${!isHidden ? "visible": "hidden"}`
  });

  const renderLine = (renderStep, text) => {
    const isHidden = (renderStep === 0 && step === MELODIES[melody][HI_HAT].length-1) || (renderStep -1 === step) 
    return (
      <div style={lineStyle(isHidden)} className='h-14 absolute top-0 w-full border-b-slate-300 border-b-2 border-t-slate-300 border-t-2 flex flex-row items-center justify-between '>
        <p className='text-3xl text-slate-300 ml-6'>{text}</p>
        <p className='text-3xl text-slate-300 mr-6'>{text}</p>
      </div>
    )
  }

  return(
    <div className='flex flex-col justify-between h-full'>
      <div id={"menu"} className={"h-20 w-full bg-gray-100 flex flex-row justify-between items-center gap-10 z-30"}>
        <div>
          <p className='text-xl text-gray-500 ml-6'>Punkte: <span className='text-blue-500'>{points}</span></p>
        </div>
        <div>
          <button onClick={() => setBpm(bpm-1)} className='text-gray-500 mr-3'>-</button>
          <input onChange={(e) => setBpm(parseInt(e.target.value))} type="range" min="0" max="450" value={bpm} className="range w-60" />
          <button onClick={() => setBpm(bpm+1)} className='text-gray-500 ml-3'>+</button>
          <span className='text-blue-500 ml-3'>{bpm} bpm</span>
        </div>
        <div className={"bg-gray-100 flex flex-row justify-between items-center gap-10 z-30"}>
          <label for="metronome" className="inline-flex relative items-center cursor-pointer">
            <input onChange={() => setWithMetronome(!withMetronome)} type="checkbox" value="" id="metronome" className="sr-only peer"/>
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">Metronome</span>
          </label>
          <select className={"bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"} defaultValue={"PUNK_1"} onChange={(e) => {
            setMelody(e.target.value);
            setBpm(MELODIES[e.target.value].SPEED)
          }}>
            {
              Object.keys(MELODIES).map((key)=>(
                <option value={key}>{MELODIES[key].NAME}</option>
              ))
            }
          </select>
          <button onClick={() => setIsRunning(!isRunning)} className="text-gray-500 rounded-full mr-6">
            {
              !isRunning
              ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )
              : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                </svg>
              )
            }
          </button>
        </div>
        
      </div>
      <div ref={raceRef} id={"race"} className={"h-full w-full bg-white flex flex-row justify-evenly items-center"}>
        {renderLine(1, 1)}
        {renderLine(5, 2)}
        {renderLine(9, 3)}
        {renderLine(13,4)}
        <div className={`h-14 absolute bottom-12 w-full border-b-slate-300 border-b-2 border-t-slate-300 border-t-2 flex flex-row items-center justify-between bg-white`}>
        </div>
        <div className='flex flex-row h-full gap-5'>
          <div id={"hiHatRace"} className={`bg-yellow-50 h-full w-32 flex flex-col items-center border-2 z-10`}>
            {renderMarble(HI_HAT, 0, 'bg-yellow-300')}
            {renderMarble(HI_HAT, 1, 'bg-yellow-300')}
            {renderMarble(HI_HAT, 2, 'bg-yellow-300')}
            {renderMarble(HI_HAT, 3, 'bg-yellow-300')}
            {renderMarble(HI_HAT, 4, 'bg-yellow-300')}
            {renderMarble(HI_HAT, 5, 'bg-yellow-300')}
            {renderMarble(HI_HAT, 6, 'bg-yellow-300')}
            {renderMarble(HI_HAT, 7, 'bg-yellow-300')}
            {renderMarble(HI_HAT, 8, 'bg-yellow-300')}
            {renderMarble(HI_HAT, 9, 'bg-yellow-300')}
            {renderMarble(HI_HAT, 10, 'bg-yellow-300')}
            {renderMarble(HI_HAT, 11, 'bg-yellow-300')}
            {renderMarble(HI_HAT, 12, 'bg-yellow-300')}
            {renderMarble(HI_HAT, 13, 'bg-yellow-300')}
            {renderMarble(HI_HAT, 14, 'bg-yellow-300')}
            {renderMarble(HI_HAT, 15, 'bg-yellow-300')}
          </div>
          <div id={"hiHatClosedRace"} className={`bg-yellow-50 h-full w-32 flex flex-col items-center border-2 z-10`}>
            {renderMarble(HI_HAT_CLOSED, 0, 'bg-yellow-300')}
            {renderMarble(HI_HAT_CLOSED, 1, 'bg-yellow-300')}
            {renderMarble(HI_HAT_CLOSED, 2, 'bg-yellow-300')}
            {renderMarble(HI_HAT_CLOSED, 3, 'bg-yellow-300')}
            {renderMarble(HI_HAT_CLOSED, 4, 'bg-yellow-300')}
            {renderMarble(HI_HAT_CLOSED, 5, 'bg-yellow-300')}
            {renderMarble(HI_HAT_CLOSED, 6, 'bg-yellow-300')}
            {renderMarble(HI_HAT_CLOSED, 7, 'bg-yellow-300')}
            {renderMarble(HI_HAT_CLOSED, 8, 'bg-yellow-300')}
            {renderMarble(HI_HAT_CLOSED, 9, 'bg-yellow-300')}
            {renderMarble(HI_HAT_CLOSED, 10, 'bg-yellow-300')}
            {renderMarble(HI_HAT_CLOSED, 11, 'bg-yellow-300')}
            {renderMarble(HI_HAT_CLOSED, 12, 'bg-yellow-300')}
            {renderMarble(HI_HAT_CLOSED, 13, 'bg-yellow-300')}
            {renderMarble(HI_HAT_CLOSED, 14, 'bg-yellow-300')}
            {renderMarble(HI_HAT_CLOSED, 15, 'bg-yellow-300')}
          </div>
        </div>
        <div id={"snareRace"} className={`bg-green-50 h-full w-32 flex flex-col items-center border-2 z-10`}>
          {renderMarble(SNARE, 0, 'bg-green-300')}
          {renderMarble(SNARE, 1, 'bg-green-300')}
          {renderMarble(SNARE, 2, 'bg-green-300')}
          {renderMarble(SNARE, 3, 'bg-green-300')}
          {renderMarble(SNARE, 4, 'bg-green-300')}
          {renderMarble(SNARE, 5, 'bg-green-300')}
          {renderMarble(SNARE, 6, 'bg-green-300')}
          {renderMarble(SNARE, 7, 'bg-green-300')}
          {renderMarble(SNARE, 8, 'bg-green-300')}
          {renderMarble(SNARE, 9, 'bg-green-300')}
          {renderMarble(SNARE, 10, 'bg-green-300')}
          {renderMarble(SNARE, 11, 'bg-green-300')}
          {renderMarble(SNARE, 12, 'bg-green-300')}
          {renderMarble(SNARE, 13, 'bg-green-300')}
          {renderMarble(SNARE, 14, 'bg-green-300')}
          {renderMarble(SNARE, 15, 'bg-green-300')}
        </div>
        <div id={"bassRace"} className={`bg-red-50 h-full w-32 flex flex-col items-center border-2 z-10`}>
          {renderMarble(BASS, 0, 'bg-red-300')}
          {renderMarble(BASS, 1, 'bg-red-300')}
          {renderMarble(BASS, 2, 'bg-red-300')}
          {renderMarble(BASS, 3, 'bg-red-300')}
          {renderMarble(BASS, 4, 'bg-red-300')}
          {renderMarble(BASS, 5, 'bg-red-300')}
          {renderMarble(BASS, 6, 'bg-red-300')}
          {renderMarble(BASS, 7, 'bg-red-300')}
          {renderMarble(BASS, 8, 'bg-red-300')}
          {renderMarble(BASS, 9, 'bg-red-300')}
          {renderMarble(BASS, 10, 'bg-red-300')}
          {renderMarble(BASS, 11, 'bg-red-300')}
          {renderMarble(BASS, 12, 'bg-red-300')}
          {renderMarble(BASS, 13, 'bg-red-300')}
          {renderMarble(BASS, 14, 'bg-red-300')}
          {renderMarble(BASS, 15, 'bg-red-300')}
        </div>
      </div>
      <div className={"h-40 flex flex-row justify-evenly items-center absolute left-0 right-0 bottom-0"}>
        <div className='flex flex-row gap-5'>
          <div className='h-32 w-32 text-right'>
            <span className={`${scoredInstruments[HI_HAT]? "opacity-100": "opacity-0"} transition-opacity ease-out z-50 rotate-12 before:block before:absolute before:-inset-1 before:-skew-y-3 before:bg-green-500 relative inline-block`}>
              <span className="relative text-white text-xl font-normal font-serif">success!</span>
            </span>
          </div>
          <div className='h-32 w-32 text-right'>
            <span className={`${scoredInstruments[HI_HAT_CLOSED] ? "opacity-100": "opacity-0"} transition-opacity ease-out z-50 rotate-12 before:block before:absolute before:-inset-1 before:-skew-y-3 before:bg-green-500 relative inline-block`}>
              <span className="relative text-white text-xl font-normal font-serif">success!</span>
            </span>
          </div>
        </div>
        <div className='h-32 w-32 text-right'>
          <span className={`${scoredInstruments[SNARE] ? "opacity-100": "opacity-0"} transition-opacity ease-out z-50 rotate-12 before:block before:absolute before:-inset-1 before:-skew-y-3 before:bg-green-500 relative inline-block`}>
            <span className="relative text-white text-xl font-normal font-serif">success!</span>
          </span>
        </div>
        <div className='h-32 w-32 text-right'>
          <span className={`${scoredInstruments[BASS]? "opacity-100": "opacity-0"} transition-opacity ease-out z-50 rotate-12 before:block before:absolute before:-inset-1 before:-skew-y-3 before:bg-green-500 relative inline-block`}>
            <span className="relative text-white text-xl font-normal font-serif">success!</span>
          </span>
        </div>
      </div>
      <div id={"action"} className={"h-40 flex flex-row justify-evenly items-center absolute left-0 right-0 bottom-0"}>
        <div className='flex flex-row gap-5'>
          <div onClick={() => recordInstrument(HI_HAT)} className={`transition-transform transform-gpu scale-${matchedInstruments[HI_HAT] ? "110 bg-yellow-400" : "100 bg-yellow-300"} shadow-sm shadow-slate-500 h-32 w-32 rounded-full flex flex-col justify-center items-center group z-20`}>
            <img src='hi-hat.png' alt='hi-hat' className="object-contain h-20 w-20 mt-1" />
              {
                hiHatFreq === 0 
                ? (<p className="text-sm group-hover:hidden">Aufnehmen</p>)
                : null
              }
            <p className="text-sm hidden group-hover:block">Aufnehmen</p>
          </div>
          <div onClick={() => recordInstrument(HI_HAT_CLOSED)} className={`transition-transform transform-gpu scale-${matchedInstruments[HI_HAT_CLOSED] ? "110 bg-yellow-400" : "100 bg-yellow-300"} shadow-sm shadow-slate-500 h-32 w-32 rounded-full flex flex-col justify-center items-center group z-20`}>
          <img src='hi-hat-closed.png' alt='hi-hat-closed' className="object-contain h-20 w-20 mt-1" />
            {
              hiHatClosedFreq === 0 
              ? (<p className="text-sm group-hover:hidden">Aufnehmen</p>)
              : null
            }
            <p className="text-sm hidden group-hover:block">Aufnehmen</p>
          </div>
        </div>
        <div onClick={() => recordInstrument(SNARE)} className={`transition-transform transform-gpu scale-${matchedInstruments[SNARE] ? "110 bg-green-400" : "100 bg-green-300"} shadow-sm shadow-slate-500 h-32 w-32 rounded-full flex flex-col justify-center items-center group z-20`}>
        <img src='snare-drum.png' alt='snare-drum' className="object-contain h-20 w-20 mt-1" />
        {
            snareFreq === 0 
            ? (<p className="text-sm group-hover:hidden">Aufnehmen</p>)
            : null
          }
          <p className="text-sm hidden group-hover:block">Aufnehmen</p>
        </div>
        <div onClick={() => recordInstrument(BASS)} className={`transition-transform transform-gpu scale-${matchedInstruments[BASS] ? "110 bg-red-400" : "100 bg-red-300"} shadow-sm shadow-slate-500 h-32 w-32 rounded-full flex flex-col justify-center items-center group z-20`}>
          <img src='bass-drum.png' alt='bass-drum' className="object-contain h-20 w-20 mt-1" />
          {
            bassFreq === 0 
            ? (<p className="text-sm group-hover:hidden">Aufnehmen</p>)
            : null
          }
          <p className="text-sm hidden group-hover:block">Aufnehmen</p>
        </div>
      </div>
      {
          isRecording
          ? (
            <div className='fixed top-1/2 text-center w-full -mt-20 z-50'>
              <p className='text-9xl text-red-600'>Recording</p>
            </div>
          )
          : null
        }
    </div>
);
}

export default App;