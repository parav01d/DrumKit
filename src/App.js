import React, { useEffect, useRef, useState } from 'react'
import fft from 'fft-js'
import { debounceTime, delay, interval, reduce, Subject, takeUntil, timer } from 'rxjs'
import {
  bassDrumAudio,
  beepAudio,
  crashAudio,
  floorTomAudio,
  floorTomAltAudio,
  highTomAudio,
  highTomAltAudio,
  hiHatAudio,
  hiHatOpenAudio,
  mediumTomAudio,
  rideAudio,
  rideAltAudio,
  snareAudio,
  snareAltAudio,
} from './Audio'
import { MELODIES } from './Melodies'

const CRASH = 'CRASH'
const HI_HAT = 'HI_HAT'
const HI_HAT_CLOSED = 'HI_HAT_CLOSED'
const HI_HAT_PEDAL = 'HI_HAT_PEDAL'
const SNARE = 'SNARE'
const HIGH_TOM = 'HIGH_TOM'
const BASS = 'BASS'
const MEDIUM_TOM = 'MEDIUM_TOM'
const RIDE = 'RIDE'
const FLOOR_TOM = 'FLOOR_TOM'

const AVAILABLE_INSTRUMENTS = [
  { name: CRASH, color: 'yellow' },
  { name: HI_HAT, color: 'yellow' },
  { name: HI_HAT_CLOSED, color: 'yellow' },
  { name: HI_HAT_PEDAL, color: 'yellow' },
  { name: SNARE, color: 'green' },
  { name: HIGH_TOM, color: 'orange' },
  { name: BASS, color: 'yellow' },
  { name: MEDIUM_TOM, color: 'orange' },
  { name: RIDE, color: 'yellow' },
  { name: FLOOR_TOM, color: 'orange' },
]

const FREQUENCY_TOLERANCE = 3
const MAGNITUDE_MINIMUM = 10

const randomIntFromInterval = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

function App() {
  const raceRef = useRef(null)
  const audioInput$ = useRef(new Subject()).current

  const crashAudioRef = useRef(null)
  const hiHatAudioRef = useRef(null)
  const hiHatClosedAudioRef = useRef(null)
  const hiHatPedalAudioRef = useRef(null)
  const snareAudioRef = useRef(null)
  const highTomAudioRef = useRef(null)
  const bassAudioRef = useRef(null)
  const mediumTomAudioRef = useRef(null)
  const rideAudioRef = useRef(null)
  const floorTomAudioRef = useRef(null)

  const matchCrash$ = useRef(new Subject()).current
  const matchSnare$ = useRef(new Subject()).current
  const matchHiHat$ = useRef(new Subject()).current
  const matchHiHatClosed$ = useRef(new Subject()).current
  const matchHiHatPedal$ = useRef(new Subject()).current
  const matchHighTom$ = useRef(new Subject()).current
  const matchBass$ = useRef(new Subject()).current
  const matchMediumTom$ = useRef(new Subject()).current
  const matchRide$ = useRef(new Subject()).current
  const matchFloorTom$ = useRef(new Subject()).current

  const scoreCrash$ = useRef(new Subject()).current
  const scoreSnare$ = useRef(new Subject()).current
  const scoreHiHat$ = useRef(new Subject()).current
  const scoreHiHatClosed$ = useRef(new Subject()).current
  const scoreHiHatPedal$ = useRef(new Subject()).current
  const scoreHighTom$ = useRef(new Subject()).current
  const scoreBass$ = useRef(new Subject()).current
  const scoreMediumTom$ = useRef(new Subject()).current
  const scoreRide$ = useRef(new Subject()).current
  const scoreFloorTom$ = useRef(new Subject()).current

  const [points, setPoints] = useState(0)

  const [melody, setMelody] = useState('PUNK_1')

  const [raceHeight, setRaceHeight] = useState(0)

  const [isRecording, setIsRecording] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const [isMelodyModalOpen, setIsMelodyModalOpen] = useState(false)

  const [bpm, setBpm] = useState(101)
  const [withMetronome, setWithMetronome] = useState(false)

  const [frequences, setFrequences] = useState(
    AVAILABLE_INSTRUMENTS.reduce((acc, curr) => {
      acc[curr.name] = 0
      return acc
    }, {})
  )

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
    15: [],
  })
  const [matchedInstruments, setMatchedInstruments] = useState({
    [CRASH]: false,
    [HI_HAT]: false,
    [HI_HAT_CLOSED]: false,
    [HI_HAT_PEDAL]: false,
    [SNARE]: false,
    [HIGH_TOM]: false,
    [BASS]: false,
    [MEDIUM_TOM]: false,
    [RIDE]: false,
    [FLOOR_TOM]: false,
  })
  const [scoredInstruments, setScoredInstruments] = useState({
    [CRASH]: false,
    [HI_HAT]: false,
    [HI_HAT_CLOSED]: false,
    [HI_HAT_PEDAL]: false,
    [SNARE]: false,
    [HIGH_TOM]: false,
    [BASS]: false,
    [MEDIUM_TOM]: false,
    [RIDE]: false,
    [FLOOR_TOM]: false,
  })

  const [step, setStep] = useState(0)

  useEffect(() => {
    if (isRunning) {
      if (MELODIES[melody][CRASH][step] === 'x') {
        const audio = new Audio(crashAudio)
        audio.play()
        audio.onended = () => audio.remove()
        crashAudioRef.current = audio
      }
      if (MELODIES[melody][MEDIUM_TOM][step] === 'x') {
        if (mediumTomAudioRef.current) {
          mediumTomAudioRef.current.pause()
          mediumTomAudioRef.current.remove()
        }
        const audio = new Audio(mediumTomAudio)
        audio.play()
        audio.onended = () => audio.remove()
        mediumTomAudioRef.current = audio
      }
      if (MELODIES[melody][HI_HAT_PEDAL][step] === 'x') {
        if (hiHatPedalAudioRef.current) {
          hiHatPedalAudioRef.current.pause()
          hiHatPedalAudioRef.current.remove()
        }
        const audio = new Audio(hiHatOpenAudio)
        audio.play()
        audio.onended = () => audio.remove()
        hiHatPedalAudioRef.current = audio
      }
      if (MELODIES[melody][HI_HAT][step] === 'x') {
        if (hiHatAudioRef.current) {
          hiHatAudioRef.current.pause()
          hiHatAudioRef.current.remove()
        }
        const audio = new Audio(hiHatOpenAudio)
        audio.play()
        audio.onended = () => audio.remove()
        hiHatAudioRef.current = audio
      }
      if (MELODIES[melody][RIDE][step] === 'x') {
        const audio = new Audio([rideAudio, rideAltAudio][randomIntFromInterval(0, 1)])
        audio.play()
        audio.onended = () => audio.remove()
        rideAudioRef.current = audio
      }
      if (MELODIES[melody][SNARE][step] === 'x') {
        if (snareAudioRef.current) {
          snareAudioRef.current.pause()
          snareAudioRef.current.remove()
        }
        const audio = new Audio([snareAudio, snareAltAudio][randomIntFromInterval(0, 1)])
        audio.play()
        audio.onended = () => audio.remove()
        snareAudioRef.current = audio
      }
      if (MELODIES[melody][HI_HAT_CLOSED][step] === 'x') {
        if (hiHatClosedAudioRef.current) {
          hiHatClosedAudioRef.current.pause()
          hiHatClosedAudioRef.current.remove()
        }
        if (hiHatAudioRef.current) {
          hiHatAudioRef.current.pause()
          hiHatAudioRef.current.remove()
        }
        if (hiHatPedalAudioRef.current) {
          hiHatPedalAudioRef.current.pause()
          hiHatPedalAudioRef.current.remove()
        }
        const audio = new Audio(hiHatAudio)
        audio.play()
        audio.onended = () => audio.remove()
        hiHatClosedAudioRef.current = audio
      }
      if (MELODIES[melody][BASS][step] === 'x') {
        if (bassAudioRef.current) {
          bassAudioRef.current.pause()
          bassAudioRef.current.remove()
        }
        const audio = new Audio(bassDrumAudio)
        audio.play()
        audio.onended = () => audio.remove()
        bassAudioRef.current = audio
      }
      if (MELODIES[melody][HIGH_TOM][step] === 'x') {
        if (highTomAudioRef.current) {
          highTomAudioRef.current.pause()
          highTomAudioRef.current.remove()
        }
        const audio = new Audio([highTomAudio, highTomAltAudio][randomIntFromInterval(0, 1)])
        audio.play()
        audio.onended = () => audio.remove()
        highTomAudioRef.current = audio
      }
      if (MELODIES[melody][FLOOR_TOM][step] === 'x') {
        if (floorTomAudioRef.current) {
          floorTomAudioRef.current.pause()
          floorTomAudioRef.current.remove()
        }
        const audio = new Audio([floorTomAudio, floorTomAltAudio][randomIntFromInterval(0, 1)])
        audio.play()
        audio.onended = () => audio.remove()
        floorTomAudioRef.current = audio
      }
    }
  }, [step, isRunning, melody])

  useEffect(() => {
    if (withMetronome && step % 4 === 0) {
      playBeep()
    }
  }, [step, withMetronome])

  useEffect(() => {
    setPoints(
      (points) =>
        points +
        [
          { instrument: CRASH, subject$: scoreCrash$ },
          { instrument: HI_HAT, subject$: scoreHiHat$ },
          { instrument: HI_HAT_CLOSED, subject$: scoreHiHatClosed$ },
          { instrument: HI_HAT_PEDAL, subject$: scoreHiHatPedal$ },
          { instrument: SNARE, subject$: scoreSnare$ },
          { instrument: HIGH_TOM, subject$: scoreHighTom$ },
          { instrument: BASS, subject$: scoreBass$ },
          { instrument: MEDIUM_TOM, subject$: scoreMediumTom$ },
          { instrument: RIDE, subject$: scoreRide$ },
          { instrument: FLOOR_TOM, subject$: scoreFloorTom$ },
        ].reduce((points, { instrument, subject$ }) => {
          if (matchedInstruments[instrument] && MELODIES[melody][instrument][step] === 'x') {
            subject$.next(instrument)
            return points + 50
          }
          return points
        }, 0)
    )
  }, [step, melody, matchedInstruments])

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      const context = new AudioContext()
      const source = context.createMediaStreamSource(stream)
      const processor = context.createScriptProcessor(1024, 1, 1)
      source.connect(processor)
      processor.connect(context.destination)
      processor.addEventListener('audioprocess', (e) => {
        const p = fft.fft(e.inputBuffer.getChannelData(0))
        const frequencies = fft.util.fftFreq(p, 8000)
        const magnitudes = fft.util.fftMag(p)

        const both = frequencies.map((f, ix) => {
          return { frequency: f, magnitude: magnitudes[ix] }
        })
        audioInput$.next(both)
      })
    })
  }, [audioInput$])

  useEffect(() => {
    setRaceHeight(raceRef.current.clientHeight)
  }, [])

  useEffect(() => {
    audioInput$.pipe().subscribe((data) => {
      const { frequency, magnitude } = data.reduce((a, c) => (a.magnitude > c.magnitude ? a : c), { frequency: 0, magnitude: 0 })

      if (frequency > FREQUENCY_TOLERANCE && magnitude > MAGNITUDE_MINIMUM) {
        if (frequency <= frequences[CRASH] + FREQUENCY_TOLERANCE && frequency >= frequences[CRASH] - FREQUENCY_TOLERANCE) {
          matchCrash$.next(CRASH)
        }
        if (frequency <= frequences[HI_HAT] + FREQUENCY_TOLERANCE && frequency >= frequences[HI_HAT] - FREQUENCY_TOLERANCE) {
          matchHiHat$.next(HI_HAT)
        }
        if (frequency <= frequences[HI_HAT_CLOSED] + FREQUENCY_TOLERANCE && frequency >= frequences[HI_HAT_CLOSED] - FREQUENCY_TOLERANCE) {
          matchHiHatClosed$.next(HI_HAT_CLOSED)
        }
        if (frequency <= frequences[HI_HAT_PEDAL] + FREQUENCY_TOLERANCE && frequency >= frequences[HI_HAT_PEDAL] - FREQUENCY_TOLERANCE) {
          matchHiHatPedal$.next(HI_HAT_PEDAL)
        }
        if (frequency <= frequences[SNARE] + FREQUENCY_TOLERANCE && frequency >= frequences[SNARE] - FREQUENCY_TOLERANCE) {
          matchSnare$.next(SNARE)
        }
        if (frequency <= frequences[HIGH_TOM] + FREQUENCY_TOLERANCE && frequency >= frequences[HIGH_TOM] - FREQUENCY_TOLERANCE) {
          matchHighTom$.next(HIGH_TOM)
        }
        if (frequency <= frequences[BASS] + FREQUENCY_TOLERANCE && frequency >= frequences[BASS] - FREQUENCY_TOLERANCE) {
          matchBass$.next(BASS)
        }
        if (frequency <= frequences[MEDIUM_TOM] + FREQUENCY_TOLERANCE && frequency >= frequences[MEDIUM_TOM] - FREQUENCY_TOLERANCE) {
          matchMediumTom$.next(MEDIUM_TOM)
        }
        if (frequency <= frequences[RIDE] + FREQUENCY_TOLERANCE && frequency >= frequences[RIDE] - FREQUENCY_TOLERANCE) {
          matchRide$.next(RIDE)
        }
        if (frequency <= frequences[FLOOR_TOM] + FREQUENCY_TOLERANCE && frequency >= frequences[FLOOR_TOM] - FREQUENCY_TOLERANCE) {
          matchFloorTom$.next(FLOOR_TOM)
        }
      }
    })
  }, [frequences])

  useEffect(() => {
    const createListener = [
      scoreCrash$,
      scoreHiHatClosed$,
      scoreHiHat$,
      scoreHiHatPedal$,
      scoreSnare$,
      scoreHighTom$,
      scoreBass$,
      scoreMediumTom$,
      scoreFloorTom$,
    ].map((s$) =>
      s$.subscribe((instrument) => {
        setScoredInstruments((scoredInst) => ({ ...scoredInst, ...{ [instrument]: true } }))
      })
    )

    const removeListener = [
      scoreCrash$,
      scoreHiHatClosed$,
      scoreHiHat$,
      scoreHiHatPedal$,
      scoreSnare$,
      scoreHighTom$,
      scoreBass$,
      scoreRide$,
      scoreFloorTom$,
    ].map((s$) =>
      s$
        .pipe(delay((60000 / bpm / 4) * MELODIES[melody].TACT()), debounceTime((60000 / bpm / 4) * MELODIES[melody].TACT()))
        .subscribe((instrument) => {
          setScoredInstruments((scoredInst) => ({ ...scoredInst, ...{ [instrument]: false } }))
        })
    )

    return () => [...createListener, ...removeListener].forEach((l) => l.unsubscribe())
  }, [bpm, melody])

  useEffect(() => {
    const createListener = [
      matchCrash$,
      matchHiHatClosed$,
      matchHiHat$,
      matchHiHatPedal$,
      matchSnare$,
      matchHighTom$,
      matchBass$,
      matchRide$,
      matchFloorTom$,
    ].map((s$) =>
      s$.subscribe((instrument) => {
        setMatchedInstruments((matchedInst) => ({ ...matchedInst, ...{ [instrument]: true } }))
      })
    )

    const removeListener = [
      matchCrash$,
      matchHiHatClosed$,
      matchHiHat$,
      matchHiHatPedal$,
      matchSnare$,
      matchHighTom$,
      matchBass$,
      matchRide$,
      matchFloorTom$,
    ].map((s$) =>
      s$
        .pipe(delay((60000 / bpm / 4) * MELODIES[melody].TACT()), debounceTime((60000 / bpm / 4) * MELODIES[melody].TACT()))
        .subscribe((instrument) => {
          setMatchedInstruments((matchedInst) => ({ ...matchedInst, ...{ [instrument]: false } }))
        })
    )
    return () => [...createListener, ...removeListener].forEach((l) => l.unsubscribe())
  }, [bpm, melody])

  useEffect(() => {
    const subscription = interval((60000 / bpm / 4) * MELODIES[melody].TACT())
      .pipe()
      .subscribe((i) => {
        const nextStep = (i + 1) % MELODIES[melody].STEPS
        const newAnimation = AVAILABLE_INSTRUMENTS.reduce((acc, instrument) => {
          if (MELODIES[melody][instrument.name][nextStep] === 'x') {
            return [...acc, instrument.name]
          }
          return acc
        }, [])
        setAnimation((animation) => ({ ...animation, ...{ [nextStep]: newAnimation } }))
        setStep(nextStep)
      })
    return () => subscription.unsubscribe()
  }, [bpm, melody])

  const recordInstrument = (instrument) => {
    setIsRecording(true)
    audioInput$
      .pipe(
        takeUntil(timer(3000)),
        reduce(
          (acc, curr) => {
            const maxMagnitude = curr.reduce((a, c) => (a.magnitude > c.magnitude ? a : c), { frequency: 0, magnitude: 0 })
            if (maxMagnitude.magnitude > acc.magnitude) {
              return maxMagnitude
            }
            return acc
          },
          { frequency: 0, magnitude: 0 }
        )
      )
      .subscribe((both) => {
        setFrequences((frequences) => ({ ...frequences, [instrument]: parseInt(both.frequency) }))
        setIsRecording(false)
      })
  }

  const playBeep = () => {
    const audio = new Audio(beepAudio)
    audio.play()
    audio.onended = () => audio.remove()
  }

  const marbleStyle = (isHidden) => ({
    transition: `all ${!isHidden ? (60000 / bpm / 4) * MELODIES[melody].TACT() * MELODIES[melody].STEPS : 0}ms linear`,
    transform: `translate(0px, ${!isHidden ? raceHeight : 0}px)`,
    visibility: `${!isHidden ? 'visible' : 'hidden'}`,
  })

  const renderMarble = (instrument, renderStep, color) => {
    const isHidden =
      (renderStep === 0 && step === MELODIES[melody].STEPS && animation[step].indexOf(instrument) >= 0) ||
      (renderStep === step && animation[renderStep].indexOf(instrument) >= 0)
    return (
      <>
        <div
          key={`${instrument}_${renderStep}_shadow`}
          style={marbleStyle(isHidden)}
          className={`rounded-full w-14 h-14 bg-${color}-600 absolute top-20 border border-${color}-900`}
        ></div>
        <div
          key={`${instrument}_${renderStep}`}
          style={marbleStyle(isHidden)}
          className={`rounded-full w-14 h-14 bg-${color}-300 absolute top-21 border border-${color}-900`}
        ></div>
      </>
    )
  }

  return (
    <div className="flex flex-col justify-between h-full overflow-hidden">
      <div id={'menu'} className={'h-20 w-full bg-gray-100 flex flex-row justify-between items-center gap-10 z-30'}>
        <div>
          <p className="text-xl text-gray-500 ml-6">
            Punkte: <span className="text-blue-500">{points}</span>
          </p>
        </div>
        <div>
          <button onClick={() => setBpm(bpm - 1)} className="text-gray-500 mr-3">
            -
          </button>
          <input onChange={(e) => setBpm(parseInt(e.target.value))} type="range" min="0" max="450" value={bpm} className="range w-60" />
          <button onClick={() => setBpm(bpm + 1)} className="text-gray-500 ml-3">
            +
          </button>
          <span className="text-blue-500 ml-3">{bpm} bpm</span>
        </div>
        <div className={'bg-gray-100 flex flex-row justify-between items-center gap-10 z-30'}>
          <label className="inline-flex relative items-center cursor-pointer">
            <input onChange={() => setWithMetronome(!withMetronome)} type="checkbox" value="" id="metronome" className="sr-only peer" />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-300">Metronome</span>
          </label>
          <button
            onClick={() => setIsMelodyModalOpen(true)}
            className="block text-white bg-gray-400 hover:bg-gray-500 focus:ring-4 focus:outline-none font-medium rounded-lg text-sm px-5 py-2.5 text-center"
            type="button"
          >
            Select Melody
          </button>
          <button onClick={() => setIsRunning(!isRunning)} className="text-gray-500 rounded-full mr-6">
            {!isRunning ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                />
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
              </svg>
            )}
          </button>
        </div>
      </div>
      <div ref={raceRef} id={'race'} className={'h-full w-full bg-white flex flex-row justify-evenly items-center'}>
        {AVAILABLE_INSTRUMENTS.filter((instrument) => MELODIES[melody][instrument.name].indexOf('x') >= 0).map((instrument) => (
          <div
            key={instrument.name}
            className={`bg-${instrument.color}-50 h-full w-32 flex flex-col items-center border-l border-r border-l-${instrument.color}-400 border-r-${instrument.color}-400  z-10`}
          >
            {[...Array(MELODIES[melody].STEPS).keys()].map((i) => renderMarble(instrument.name, i, instrument.color))}
          </div>
        ))}
      </div>
      <div className={'h-40 flex flex-row justify-evenly items-center absolute left-0 right-0 bottom-0'}>
        {AVAILABLE_INSTRUMENTS.filter((instrument) => MELODIES[melody][instrument.name].indexOf('x') >= 0).map((instrument) => (
          <div key={instrument.name} className="h-32 w-32 text-right">
            <span
              className={`${
                scoredInstruments[instrument.name] ? 'opacity-100' : 'opacity-0'
              } transition-opacity ease-out z-50 rotate-12 before:block before:absolute before:-inset-1 before:-skew-y-3 before:bg-green-500 relative inline-block`}
            >
              <span className="relative text-white text-xl font-normal font-serif">success!</span>
            </span>
          </div>
        ))}
      </div>
      <div id={'action'} className={'h-40 flex flex-row justify-evenly items-center absolute left-0 right-0 bottom-0'}>
        {AVAILABLE_INSTRUMENTS.filter((instrument) => MELODIES[melody][instrument.name].indexOf('x') >= 0).map((instrument) => (
          <div className="h-32 w-32 flex justify-center items-center">
            <div
              key={instrument.name}
              onClick={() => recordInstrument(instrument.name)}
              className={`absolute transition-transform transform-gpu scale-${
                matchedInstruments[instrument.name] ? `110 bg-${instrument.color}-400` : `100 bg-${instrument.color}-300`
              } border border-${instrument.color}-600 h-28 w-28 rounded-full flex flex-col justify-center items-center group z-20`}
            >
              <img src={`${instrument.name}.png`} alt={`${instrument.name}_image`} className="object-contain h-16 w-16" />
            </div>
          </div>
        ))}
      </div>
      {isRecording ? (
        <div className="fixed top-1/2 text-center w-full -mt-20 z-50">
          <p className="text-9xl text-red-600">Recording</p>
        </div>
      ) : null}
      <div
        className={`${
          isMelodyModalOpen ? 'visible' : 'hidden'
        } overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 w-full md:inset-0 h-modal md:h-full flex flex-row justify-center items-center`}
      >
        <div className="relative p-4 w-full max-w-2xl h-full md:h-4/6">
          <div className="relative bg-white rounded-lg shadow ">
            <div className="p-6 space-y-6 overflow-scroll">
              {[
                Object.keys(MELODIES).map((key) => (
                  <div
                    key={key}
                    onClick={() => {
                      setMelody(key)
                      setBpm(MELODIES[key].SPEED)
                      setIsMelodyModalOpen(false)
                    }}
                    className="block p-6 bg-white rounded-lg border border-gray-200 shadow-md cursor-pointer"
                  >
                    <p className="text-lg font-semibold">{MELODIES[key].NAME}</p>
                    <img src={`notes/${MELODIES[key].IMAGE}`} alt={`${MELODIES[key].NAME}`} className={'object-contain h-96'} />
                  </div>
                )),
              ]}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
