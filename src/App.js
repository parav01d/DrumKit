import React, { useEffect, useRef, useState } from 'react';
import fft from "fft-js";
import { debounceTime, delay, interval, reduce,  Subject, takeUntil, timer } from 'rxjs';

const HI_HAT = "HI_HAT";
const HI_HAT_CLOSED = "HI_HAT_CLOSED";
const SNARE = "SNARE";
const BASS = "BASS";

const FREQUENCY_TOLERANCE = 3;
const MELODY = {
  SNARE:         "----x-------x---",
  HI_HAT:        "----------------",
  HI_HAT_CLOSED: "x---x---x---x---",
  BASS:          "x---------x-----"
}

function App() {

  const raceRef = useRef(null)
  const audioInput$ = useRef(new Subject()).current;
  const matchSnare$ = useRef(new Subject()).current;
  const matchHiHat$ = useRef(new Subject()).current;
  const matchHiHatClosed$ = useRef(new Subject()).current;
  const matchBass$ = useRef(new Subject()).current;

  const [points, setPoints] = useState(0)

  const [raceHeight, setRaceHeight] = useState(0)

  const [isRecording, setIsRecording] = useState(false);
  const [isRunning, setIsRunning] = useState(true);
  const [bpm, setBpm] = useState(200);

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

  const [step, setStep] = useState(0);

  useEffect(() => {
    var additionalPoints = 0
    if(matchedInstruments[HI_HAT] && MELODY[HI_HAT][step] === "x") {
      console.log("match hihat")
      additionalPoints = additionalPoints + 50
    }
    if(matchedInstruments[HI_HAT_CLOSED] && MELODY[HI_HAT_CLOSED][step] === "x") {
      console.log("match hihat closed")
      additionalPoints = additionalPoints + 50
    }
    if(matchedInstruments[SNARE] && MELODY[SNARE][step] === "x") {
      console.log("match snare")
      additionalPoints = additionalPoints + 50
    }
    if(matchedInstruments[BASS] && MELODY[BASS][step] === "x") {
      console.log("match bass")
      additionalPoints = additionalPoints + 50
    }
    setPoints((points) => points + additionalPoints);
  }, [step])

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
    matchHiHatClosed$.subscribe((instrument) => {
      setMatchedInstruments((matchedInst) => ({...matchedInst, ...{[instrument]: true} }))
    })
    matchHiHatClosed$.pipe(delay(60000/bpm/4), debounceTime(60000/bpm/4)).subscribe((instrument) => {
      setMatchedInstruments((matchedInst) => ({...matchedInst, ...{[instrument]: false} }))
    })
    matchHiHat$.subscribe((instrument) => {
      setMatchedInstruments((matchedInst) => ({...matchedInst, ...{[instrument]: true} }))
    })
    matchHiHat$.pipe(delay(60000/bpm/4), debounceTime(60000/bpm/4)).subscribe((instrument) => {
      setMatchedInstruments((matchedInst) => ({...matchedInst, ...{[instrument]: false} }))
    })
    matchSnare$.subscribe((instrument) => {
      setMatchedInstruments((matchedInst) => ({...matchedInst, ...{[instrument]: true} }))
    })
    matchSnare$.pipe(delay(60000/bpm/4), debounceTime(60000/bpm/4)).subscribe((instrument) => {
      setMatchedInstruments((matchedInst) => ({...matchedInst, ...{[instrument]: false} }))
    })
    matchBass$.subscribe((instrument) => {
      setMatchedInstruments((matchedInst) => ({...matchedInst, ...{[instrument]: true} }))
    })
    matchBass$.pipe(delay(60000/bpm/4), debounceTime(60000/bpm/4)).subscribe((instrument) => {
      setMatchedInstruments((matchedInst) => ({...matchedInst, ...{[instrument]: false} }))
    })
  }, [matchHiHatClosed$, matchHiHat$, matchSnare$, matchBass$])

  useEffect(() => {

    const subscription = interval(60000/bpm/4).pipe(
      ).subscribe((i) => {
        if(isRunning) {
          const newAnimation = []
          if(MELODY[SNARE][(i+1)%MELODY[SNARE].length] === "x") {
            newAnimation.push(SNARE);
          }
          if(MELODY[HI_HAT][(i+1)%MELODY[HI_HAT].length] === "x") {
            newAnimation.push(HI_HAT);
          }
          if(MELODY[HI_HAT_CLOSED][(i+1)%MELODY[HI_HAT_CLOSED].length] === "x") {
            newAnimation.push(HI_HAT_CLOSED);
          }
          if(MELODY[BASS][(i+1)%MELODY[BASS].length] === "x") {
            newAnimation.push(BASS);
          }
          setAnimation((animation) => ({...animation, ...{[(i+1)%MELODY[BASS].length]: newAnimation}}));
          setStep((i+1)%MELODY[BASS].length);
        }
    })
    return () => subscription.unsubscribe();
        
  },[bpm, isRunning] )

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

  const marbleStyle = (isHidden) => ({
    transition: `all ${!isHidden?((60/bpm/4)*16):0}s linear`,
    transform: `translate(0px, ${!isHidden?(raceHeight):0}px)`,
    visibility: `${!isHidden ? "visible": "hidden"}`
  });

  const renderMarble = (instrument, renderStep, color) => {
    const isHidden = ((renderStep === 0 && step === 15) && (animation[step].indexOf(instrument) >= 0)) 
    || ((renderStep -1 === step) && (animation[renderStep-1].indexOf(instrument) >= 0)) 
    return (
      <div key={`${instrument}_${renderStep}`} style={marbleStyle(isHidden)} className={`shadow-sm shadow-slate-500 rounded-full w-14 h-14 ${color} absolute top-0`}></div>
    )
  }

  const lineStyle = (isHidden) => ({
    transition: `all ${!isHidden?((60/bpm/4)*16):0}s linear`,
    transform: `translate(0px, ${!isHidden?(raceHeight):0}px)`,
    visibility: `${!isHidden ? "visible": "hidden"}`
  });

  const renderLine = (renderStep, text) => {
    const isHidden = (renderStep === 0 && step === 15) || (renderStep -1 === step) 
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
          <p className='text-xl text-gray-500 ml-6'>Punkte: {points}</p>
        </div>
        <div>
          <button onClick={() => setBpm(bpm-1)} className='text-gray-500 mr-3'>-</button>
          <input onChange={(e) => setBpm(parseInt(e.target.value))} type="range" min="0" max="450" value={bpm} className="range w-60" />
          <button onClick={() => setBpm(bpm+1)} className='text-gray-500 ml-3'>+</button>
          <span className='text-blue-500 ml-3'>{bpm} bpm</span>
        </div>
        <div>
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
      <div id={"action"} className={"h-40 flex flex-row justify-evenly items-center absolute left-0 right-0 bottom-0"}>
        <div className='flex flex-row gap-5'>
          <div onClick={() => recordInstrument(HI_HAT)} className={`transition-transform transform-gpu scale-x-${matchedInstruments[HI_HAT] ? "110 bg-yellow-400" : "100 bg-yellow-300"} shadow-sm shadow-slate-500 h-32 w-32 rounded-full flex flex-col justify-center items-center group z-20`}>
            <p className="text-lg group-hover:hidden">Hi Hat</p>
            {
              hiHatFreq !== 0 
              ? (<>
                <p className="text-sm group-hover:hidden">{hiHatFreq} Hz</p>
              </>)
              : (<p className="text-lg group-hover:hidden">Aufnehmen</p>)
            }
            <p className="text-lg hidden group-hover:block">Aufnehmen</p>
          </div>
          <div onClick={() => recordInstrument(HI_HAT_CLOSED)} className={`transition-transform transform-gpu scale-x-${matchedInstruments[HI_HAT_CLOSED] ? "110 bg-yellow-400" : "100 bg-yellow-300"} shadow-sm shadow-slate-500 h-32 w-32 rounded-full flex flex-col justify-center items-center group z-20`}>
            <p className="text-lg group-hover:hidden">Hi Hat Closed</p>
            {
              hiHatClosedFreq !== 0 
              ? (<>
                <p className="text-sm group-hover:hidden">{hiHatClosedFreq} Hz</p>
              </>)
              : (<p className="text-lg group-hover:hidden">Aufnehmen</p>)
            }
            <p className="text-lg hidden group-hover:block">Aufnehmen</p>
          </div>
        </div>
        <div onClick={() => recordInstrument(SNARE)} className={`transition-transform transform-gpu scale-${matchedInstruments[SNARE] ? "110 bg-green-400" : "100 bg-green-300"} shadow-sm shadow-slate-500 h-32 w-32 rounded-full flex flex-col justify-center items-center group z-20`}>
          <p className="text-lg group-hover:hidden">Snare</p>
          {
            snareFreq !== 0 
            ? (<>
              <p className="text-sm group-hover:hidden">{snareFreq} Hz</p>
            </>)
            : (<p className="text-lg group-hover:hidden">Aufnehmen</p>)
          }
          <p className="text-lg hidden group-hover:block">Aufnehmen</p>
        </div>
        <div onClick={() => recordInstrument(BASS)} className={`transition-transform transform-gpu scale-${matchedInstruments[BASS] ? "110 bg-red-400" : "100 bg-red-300"} shadow-sm shadow-slate-500 h-32 w-32 rounded-full flex flex-col justify-center items-center group z-20`}>
          <p className="text-lg group-hover:hidden">Bass</p>
          {
          
            bassFreq !== 0 
            ? (<>
              <p className="text-sm group-hover:hidden">{bassFreq} Hz</p>
            </>)
            : (<p className="text-lg group-hover:hidden">Aufnehmen</p>)
          }
          <p className="text-lg hidden group-hover:block">Aufnehmen</p>
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