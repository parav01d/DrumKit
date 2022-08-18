import React, { useEffect, useRef, useState } from 'react'
import fft from 'fft-js'
import { debounceTime, delay, interval, reduce, Subject, takeUntil, timer } from 'rxjs'

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
const MELODIES = {
  TEST: {
    CRASH: '-x--x---x---x---',
    HI_HAT: '--x---x---x---x-',
    HI_HAT_CLOSED: 'x---x---x---x---',
    HI_HAT_PEDAL: '----------------',
    SNARE: '----x-------x---',
    HIGH_TOM: '--x----x---x---x',
    BASS: 'x--x---x------x-',
    MEDIUM_TOM: '---x-----x-x----',
    RIDE: '--x---x----x--x-',
    FLOOR_TOM: '--x---x----x----',
    SPEED: 202,
    TACT: () => 4 / 4,
    STEPS: 16,
    NAME: 'Test',
  },
  PUNK_1: {
    CRASH: '----------------',
    HI_HAT: '----------------',
    HI_HAT_CLOSED: 'x---x---x---x---',
    HI_HAT_PEDAL: '----------------',
    SNARE: '----x-------x---',
    HIGH_TOM: '----------------',
    BASS: 'x---------x-----',
    MEDIUM_TOM: '----------------',
    RIDE: '----------------',
    FLOOR_TOM: '----------------',
    SPEED: 202,
    TACT: () => 4 / 4,
    STEPS: 16,
    NAME: 'Punk 1',
  },
  PUNK_2: {
    CRASH: '----------------',
    HI_HAT: '----------------',
    HI_HAT_CLOSED: 'x---x---x---x---',
    HI_HAT_PEDAL: '----------------',
    SNARE: '----x-------x---',
    HIGH_TOM: '----------------',
    BASS: 'x-----x---x-----',
    MEDIUM_TOM: '----------------',
    RIDE: '----------------',
    FLOOR_TOM: '----------------',
    SPEED: 202,
    TACT: () => 4 / 4,
    STEPS: 16,
    NAME: 'Punk 2',
  },
  PUNK_3: {
    CRASH: '----------------',
    HI_HAT: '----------------',
    HI_HAT_CLOSED: 'x---x---x---x---',
    HI_HAT_PEDAL: '----------------',
    SNARE: '----x-------x---',
    HIGH_TOM: '----------------',
    BASS: '--x---x-x-------',
    MEDIUM_TOM: '----------------',
    RIDE: '----------------',
    FLOOR_TOM: '----------------',
    SPEED: 202,
    TACT: () => 4 / 4,
    STEPS: 16,
    NAME: 'Punk 3',
  },
  PUNK_4: {
    CRASH: '----------------',
    HI_HAT: '----------------',
    HI_HAT_CLOSED: 'x---x---x---x---',
    HI_HAT_PEDAL: '----------------',
    SNARE: '----x-------x---',
    HIGH_TOM: '----------------',
    BASS: 'x-x---x-x-x-----',
    MEDIUM_TOM: '----------------',
    RIDE: '----------------',
    FLOOR_TOM: '----------------',
    SPEED: 202,
    TACT: () => 4 / 4,
    STEPS: 16,
    NAME: 'Punk 4',
  },
  ROCK_1: {
    CRASH: '----------------',
    HI_HAT: '----------------',
    HI_HAT_CLOSED: 'x---x---x---x---',
    HI_HAT_PEDAL: '----------------',
    SNARE: '----x-------x---',
    HIGH_TOM: '----------------',
    BASS: 'x-------x-------',
    MEDIUM_TOM: '----------------',
    RIDE: '----------------',
    FLOOR_TOM: '----------------',
    SPEED: 132,
    TACT: () => 4 / 4,
    STEPS: 16,
    NAME: 'Rock 1',
  },
  ROCK_2: {
    CRASH: '----------------',
    HI_HAT: '----------------',
    HI_HAT_CLOSED: 'x---x---x---x---',
    HI_HAT_PEDAL: '----------------',
    SNARE: '----x-------x---',
    HIGH_TOM: '----------------',
    BASS: 'x---x---x---x---',
    MEDIUM_TOM: '----------------',
    RIDE: '----------------',
    FLOOR_TOM: '----------------',
    SPEED: 132,
    TACT: () => 4 / 4,
    STEPS: 16,
    NAME: 'Rock 2',
  },
  ROCK_3: {
    CRASH: '----------------',
    HI_HAT: '----------------',
    HI_HAT_CLOSED: 'x---x---x---x---',
    HI_HAT_PEDAL: '----------------',
    SNARE: '----x-------x---',
    HIGH_TOM: '----------------',
    BASS: 'x-----x-x-------',
    MEDIUM_TOM: '----------------',
    RIDE: '----------------',
    FLOOR_TOM: '----------------',
    SPEED: 132,
    TACT: () => 4 / 4,
    STEPS: 16,
    NAME: 'Rock 3',
  },
  ROCK_4: {
    CRASH: '----------------',
    HI_HAT: '----------------',
    HI_HAT_CLOSED: 'x---x---x---x---',
    HI_HAT_PEDAL: '----------------',
    SNARE: '----x-------x---',
    HIGH_TOM: '----------------',
    BASS: 'x-------x-x-----',
    MEDIUM_TOM: '----------------',
    RIDE: '----------------',
    FLOOR_TOM: '----------------',
    SPEED: 132,
    TACT: () => 4 / 4,
    STEPS: 16,
    NAME: 'Rock 4',
  },
  ROCK_8THS_1: {
    CRASH: '----------------',
    HI_HAT: '----------------',
    HI_HAT_CLOSED: 'x-x-x-x-x-x-x-x-',
    HI_HAT_PEDAL: '----------------',
    SNARE: '----x-------x---',
    HIGH_TOM: '----------------',
    BASS: 'x-------x-----x-',
    MEDIUM_TOM: '----------------',
    RIDE: '----------------',
    FLOOR_TOM: '----------------',
    SPEED: 132,
    TACT: () => 4 / 4,
    STEPS: 16,
    NAME: 'Rock 8ths 1',
  },
  ROCK_8THS_2: {
    CRASH: '----------------',
    HI_HAT: '----------------',
    HI_HAT_CLOSED: 'x-x-x-x-x-x-x-x-',
    HI_HAT_PEDAL: '----------------',
    SNARE: '----x-------x---',
    HIGH_TOM: '----------------',
    BASS: 'x-x-----x-x-----',
    MEDIUM_TOM: '----------------',
    RIDE: '----------------',
    FLOOR_TOM: '----------------',
    SPEED: 132,
    TACT: () => 4 / 4,
    STEPS: 16,
    NAME: 'Rock 8ths 2',
  },
  ROCK_8THS_3: {
    CRASH: '----------------',
    HI_HAT: '----------------',
    HI_HAT_CLOSED: 'x-x-x-x-x-x-x-x-',
    HI_HAT_PEDAL: '----------------',
    SNARE: '----x-------x---',
    HIGH_TOM: '----------------',
    BASS: 'x-x---x-x-------',
    MEDIUM_TOM: '----------------',
    RIDE: '----------------',
    FLOOR_TOM: '----------------',
    SPEED: 132,
    TACT: () => 4 / 4,
    STEPS: 16,
    NAME: 'Rock 8ths 3',
  },
  ROCK_8THS_4: {
    CRASH: '----------------',
    HI_HAT: '----------------',
    HI_HAT_CLOSED: 'x-x-x-x-x-x-x-x-',
    HI_HAT_PEDAL: '----------------',
    SNARE: '----x-------x---',
    HIGH_TOM: '----------------',
    BASS: 'x-x---x---x-----',
    MEDIUM_TOM: '----------------',
    RIDE: '----------------',
    FLOOR_TOM: '----------------',
    SPEED: 132,
    TACT: () => 4 / 4,
    STEPS: 16,
    NAME: 'Rock 8ths 4',
  },
  ROCK_SLOW_16THS_1: {
    CRASH: '----------------',
    HI_HAT: '----------------',
    HI_HAT_CLOSED: 'xxxxxxxxxxxxxxxx',
    HI_HAT_PEDAL: '----------------',
    SNARE: '----x-------x---',
    HIGH_TOM: '----------------',
    BASS: 'x-----x-x-------',
    MEDIUM_TOM: '----------------',
    RIDE: '----------------',
    FLOOR_TOM: '----------------',
    SPEED: 80,
    TACT: () => 4 / 4,
    STEPS: 16,
    NAME: 'Rock Slow 16ths 1',
  },
  ROCK_SLOW_16THS_2: {
    CRASH: '----------------',
    HI_HAT: '----------------',
    HI_HAT_CLOSED: 'xxxxxxxxxxxxxxxx',
    HI_HAT_PEDAL: '----------------',
    SNARE: '----x-------x---',
    HIGH_TOM: '----------------',
    BASS: 'x------xx-------',
    MEDIUM_TOM: '----------------',
    RIDE: '----------------',
    FLOOR_TOM: '----------------',
    SPEED: 80,
    TACT: () => 4 / 4,
    STEPS: 16,
    NAME: 'Rock Slow 16ths 2',
  },
  ROCK_SLOW_16THS_3: {
    CRASH: '----------------',
    HI_HAT: '----------------',
    HI_HAT_CLOSED: 'xxxxxxxxxxxxxxxx',
    HI_HAT_PEDAL: '----------------',
    SNARE: '----x-------x---',
    HIGH_TOM: '----------------',
    BASS: 'x------xx-x-----',
    MEDIUM_TOM: '----------------',
    RIDE: '----------------',
    FLOOR_TOM: '----------------',
    SPEED: 80,
    TACT: () => 4 / 4,
    STEPS: 16,
    NAME: 'Rock Slow 16ths 3',
  },
  ROCK_SLOW_16THS_4: {
    CRASH: '----------------',
    HI_HAT: '----------------',
    HI_HAT_CLOSED: 'xxxxxxxxxxxxxxxx',
    HI_HAT_PEDAL: '----------------',
    SNARE: '----x-------x---',
    HIGH_TOM: '----------------',
    BASS: 'x------xx-----x-',
    MEDIUM_TOM: '----------------',
    RIDE: '----------------',
    FLOOR_TOM: '----------------',
    SPEED: 80,
    TACT: () => 4 / 4,
    STEPS: 16,
    NAME: 'Rock Slow 16ths 4',
  },
  ROCK_SLOW_12_8_1: {
    CRASH: '------------',
    HI_HAT: '------------',
    HI_HAT_CLOSED: 'xxxxxxxxxxxx',
    HI_HAT_PEDAL: '------------',
    SNARE: '---x-----x--',
    HIGH_TOM: '------------',
    BASS: 'x-----x-----',
    MEDIUM_TOM: '------------',
    RIDE: '------------',
    FLOOR_TOM: '------------',
    SPEED: 60,
    TACT: () => 12 / 8,
    STEPS: 12,
    NAME: 'Rock Slow 12/8 1',
  },
  ROCK_SLOW_12_8_2: {
    CRASH: '------------',
    HI_HAT: '------------',
    HI_HAT_CLOSED: 'xxxxxxxxxxxx',
    HI_HAT_PEDAL: '------------',
    SNARE: '---x-----x--',
    HIGH_TOM: '------------',
    BASS: 'x----xx-----',
    MEDIUM_TOM: '------------',
    RIDE: '------------',
    FLOOR_TOM: '------------',
    SPEED: 60,
    TACT: () => 12 / 8,
    STEPS: 12,
    NAME: 'Rock Slow 12/8 2',
  },
  ROCK_SLOW_12_8_3: {
    CRASH: '------------',
    HI_HAT: '------------',
    HI_HAT_CLOSED: 'xxxxxxxxxxxx',
    HI_HAT_PEDAL: '------------',
    SNARE: '---x-----x--',
    HIGH_TOM: '------------',
    BASS: 'x----xx----x',
    MEDIUM_TOM: '------------',
    RIDE: '------------',
    FLOOR_TOM: '------------',
    SPEED: 60,
    TACT: () => 12 / 8,
    STEPS: 12,
    NAME: 'Rock Slow 12/8 3',
  },
  ROCK_SLOW_12_8_4: {
    CRASH: '------------',
    HI_HAT: '------------',
    HI_HAT_CLOSED: 'xxxxxxxxxxxx',
    HI_HAT_PEDAL: '------------',
    SNARE: '---x-----x--',
    HIGH_TOM: '------------',
    BASS: 'x-x--xx-----',
    MEDIUM_TOM: '------------',
    RIDE: '------------',
    FLOOR_TOM: '------------',
    SPEED: 60,
    TACT: () => 12 / 8,
    STEPS: 12,
    NAME: 'Rock Slow 12/8 4',
  },
  ALT_ROCK_1: {
    CRASH: '----------------',
    HI_HAT: '----------------',
    HI_HAT_CLOSED: 'x-x-x-x-x-x-x-x-',
    HI_HAT_PEDAL: '----------------',
    SNARE: '----x------x--x-',
    HIGH_TOM: '----------------',
    BASS: 'x-x-----x---x---',
    MEDIUM_TOM: '----------------',
    RIDE: '----------------',
    FLOOR_TOM: '----------------',
    SPEED: 112,
    TACT: () => 4 / 4,
    STEPS: 16,
    NAME: 'Alt Rock 1',
  },
  BEACH_MUSIC_A_1: {
    CRASH: '----------------',
    HI_HAT: '----------------',
    HI_HAT_CLOSED: '----------------',
    HI_HAT_PEDAL: '----------------',
    SNARE: '----x-x-----x---',
    HIGH_TOM: '----------------',
    BASS: 'x-------x-------',
    MEDIUM_TOM: '----------------',
    RIDE: '----------------',
    FLOOR_TOM: 'x-x-x-x-x-x-x-x-',
    SPEED: 130,
    TACT: () => 4 / 4,
    STEPS: 16,
    NAME: 'Beach Music A 1',
  },
  BEACH_MUSIC_A_2: {
    CRASH: '----------------',
    HI_HAT: '----------------',
    HI_HAT_CLOSED: '----------------',
    HI_HAT_PEDAL: '----------------',
    SNARE: '----x-x-----x---',
    HIGH_TOM: '----------------',
    BASS: 'x-------x-------',
    MEDIUM_TOM: '----------------',
    RIDE: 'x-x-x-x-x-x-x-x-',
    FLOOR_TOM: '----------------',
    SPEED: 130,
    TACT: () => 4 / 4,
    STEPS: 16,
    NAME: 'Beach Music A 2',
  },
  BEACH_MUSIC_A_3: {
    CRASH: '----------------',
    HI_HAT: '----------------',
    HI_HAT_CLOSED: '----------------',
    HI_HAT_PEDAL: '----------------',
    SNARE: '----x-------x---',
    HIGH_TOM: '----------------',
    BASS: 'x-----x-x-------',
    MEDIUM_TOM: '----------------',
    RIDE: 'x-x-x-x-x-x-x-x-',
    FLOOR_TOM: '----------------',
    SPEED: 130,
    TACT: () => 4 / 4,
    STEPS: 16,
    NAME: 'Beach Music A 3',
  },
  BEACH_MUSIC_A_4: {
    CRASH: '----------------',
    HI_HAT: '----------------',
    HI_HAT_CLOSED: '----------------',
    HI_HAT_PEDAL: '----------------',
    SNARE: '----x-------x---',
    HIGH_TOM: '----------------',
    BASS: 'x-----x-x-------',
    MEDIUM_TOM: '----------------',
    RIDE: 'x-x-x-x-x-x-x-x-',
    FLOOR_TOM: '----------------',
    SPEED: 130,
    TACT: () => 4 / 4,
    STEPS: 16,
    NAME: 'Beach Music A 4',
  },
  BOOGIE_WOOGIE_1: {
    CRASH: '----------------',
    HI_HAT: '----x-------x---',
    HI_HAT_CLOSED: 'x-x---x-x-x---x-',
    HI_HAT_PEDAL: '----------------',
    SNARE: '------x-------x-',
    HIGH_TOM: '----------------',
    BASS: 'x-x-x---x-x-x---',
    MEDIUM_TOM: '----------------',
    RIDE: '----------------',
    FLOOR_TOM: '----------------',
    SPEED: 146,
    TACT: () => 4 / 4,
    STEPS: 16,
    NAME: 'Boogie Woogie 1',
  },
  BOOGIE_WOOGIE_2: {
    CRASH: '----------------',
    HI_HAT: '----------------',
    HI_HAT_CLOSED: '----------------',
    HI_HAT_PEDAL: 'x---x---x---x---',
    SNARE: '----x-------x---',
    HIGH_TOM: '----------------',
    BASS: 'x--x---xx--x---x',
    MEDIUM_TOM: '----------------',
    RIDE: 'x--xx--xx--xx--x',
    FLOOR_TOM: '----------------',
    SPEED: 146,
    TACT: () => 4 / 4,
    STEPS: 16,
    NAME: 'Boogie Woogie 2',
  },
}

function App() {
  const raceRef = useRef(null)
  const audioInput$ = useRef(new Subject()).current

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
  const [isRunning, setIsRunning] = useState(true)
  const [bpm, setBpm] = useState(202)
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
    if (withMetronome && step % 4 === 0) {
      beep()
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
        if (isRunning) {
          const nextStep = (i + 1) % MELODIES[melody].STEPS
          const newAnimation = AVAILABLE_INSTRUMENTS.reduce((acc, instrument) => {
            if (MELODIES[melody][instrument.name][nextStep] === 'x') {
              return [...acc, instrument.name]
            }
            return acc
          }, [])
          setAnimation((animation) => ({ ...animation, ...{ [nextStep]: newAnimation } }))
          setStep(nextStep)
        }
      })
    return () => subscription.unsubscribe()
  }, [bpm, isRunning, melody])

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

  const beep = () => {
    const snd = new Audio(
      'data:audio/wav;base64,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qJrx4KOQjahZxWbcZgztj2c49nKmkId44S71j0c8eV9yDK6uPRzx5X18eDvjvQ6yKo9ZSS6l//8elePK/Lf//IInrOF/FvDoADYAGBMGb7FtErm5MXMlmPAJQVgWta7Zx2go+8xJ0UiCb8LHHdftWyLJE0QIAIsI+UbXu67dZMjmgDGCGl1H+vpF4NSDckSIkk7Vd+sxEhBQMRU8j/12UIRhzSaUdQ+rQU5kGeFxm+hb1oh6pWWmv3uvmReDl0UnvtapVaIzo1jZbf/pD6ElLqSX+rUmOQNpJFa/r+sa4e/pBlAABoAAAAA3CUgShLdGIxsY7AUABPRrgCABdDuQ5GC7DqPQCgbbJUAoRSUj+NIEig0YfyWUho1VBBBA//uQZB4ABZx5zfMakeAAAAmwAAAAF5F3P0w9GtAAACfAAAAAwLhMDmAYWMgVEG1U0FIGCBgXBXAtfMH10000EEEEEECUBYln03TTTdNBDZopopYvrTTdNa325mImNg3TTPV9q3pmY0xoO6bv3r00y+IDGid/9aaaZTGMuj9mpu9Mpio1dXrr5HERTZSmqU36A3CumzN/9Robv/Xx4v9ijkSRSNLQhAWumap82WRSBUqXStV/YcS+XVLnSS+WLDroqArFkMEsAS+eWmrUzrO0oEmE40RlMZ5+ODIkAyKAGUwZ3mVKmcamcJnMW26MRPgUw6j+LkhyHGVGYjSUUKNpuJUQoOIAyDvEyG8S5yfK6dhZc0Tx1KI/gviKL6qvvFs1+bWtaz58uUNnryq6kt5RzOCkPWlVqVX2a/EEBUdU1KrXLf40GoiiFXK///qpoiDXrOgqDR38JB0bw7SoL+ZB9o1RCkQjQ2CBYZKd/+VJxZRRZlqSkKiws0WFxUyCwsKiMy7hUVFhIaCrNQsKkTIsLivwKKigsj8XYlwt/WKi2N4d//uQRCSAAjURNIHpMZBGYiaQPSYyAAABLAAAAAAAACWAAAAApUF/Mg+0aohSIRobBAsMlO//Kk4soosy1JSFRYWaLC4qZBYWFRGZdwqKiwkNBVmoWFSJkWFxX4FFRQWR+LsS4W/rFRb/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////VEFHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAU291bmRib3kuZGUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMjAwNGh0dHA6Ly93d3cuc291bmRib3kuZGUAAAAAAAAAACU='
    )
    snd.play()
  }

  const marbleStyle = (isHidden) => ({
    transition: `all ${!isHidden ? (60 / bpm / 4) * MELODIES[melody].TACT() * MELODIES[melody].STEPS : 0}s linear`,
    transform: `translate(0px, ${!isHidden ? raceHeight : 0}px)`,
    visibility: `${!isHidden ? 'visible' : 'hidden'}`,
  })

  const renderMarble = (instrument, renderStep, color) => {
    const isHidden =
      (renderStep === 0 && step === MELODIES[melody].STEPS - 1 && animation[step].indexOf(instrument) >= 0) ||
      (renderStep - 1 === step && animation[renderStep - 1].indexOf(instrument) >= 0)
    return (
      <div
        key={`${instrument}_${renderStep}`}
        style={marbleStyle(isHidden)}
        className={`shadow-sm shadow-slate-500 rounded-full w-14 h-14 ${color} absolute top-0`}
      ></div>
    )
  }

  const lineStyle = (isHidden) => ({
    transition: `all ${!isHidden ? (60 / bpm / 4) * MELODIES[melody].TACT() * MELODIES[melody].STEPS : 0}s linear`,
    transform: `translate(0px, ${!isHidden ? raceHeight : 0}px)`,
    visibility: `${!isHidden ? 'visible' : 'hidden'}`,
  })

  const renderLine = (renderStep, text) => {
    const isHidden = (renderStep === 0 && step === MELODIES[melody].STEPS - 1) || renderStep - 1 === step
    return (
      <div
        style={lineStyle(isHidden)}
        className="h-14 absolute top-0 w-full border-b-slate-300 border-b-2 border-t-slate-300 border-t-2 flex flex-row items-center justify-between "
      >
        <p className="text-3xl text-slate-300 ml-6">{text}</p>
        <p className="text-3xl text-slate-300 mr-6">{text}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col justify-between h-full">
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
          <select
            className={
              'bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'
            }
            defaultValue={'PUNK_1'}
            onChange={(e) => {
              setMelody(e.target.value)
              setBpm(MELODIES[e.target.value].SPEED)
            }}
          >
            {Object.keys(MELODIES).map((key) => (
              <option value={key}>{MELODIES[key].NAME}</option>
            ))}
          </select>
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
        {renderLine(1, 1)}
        {renderLine(5, 2)}
        {renderLine(9, 3)}
        {renderLine(13, 4)}
        <div
          className={`h-14 absolute bottom-12 w-full border-b-slate-300 border-b-2 border-t-slate-300 border-t-2 flex flex-row items-center justify-between bg-white`}
        />
        {AVAILABLE_INSTRUMENTS.filter((instrument) => MELODIES[melody][instrument.name].indexOf('x') >= 0).map((instrument) => (
          <div className={`bg-${instrument.color}-50 h-full w-32 flex flex-col items-center border-2 z-10`}>
            {[...Array(MELODIES[melody].STEPS).keys()].map((i) => renderMarble(instrument.name, i, `bg-${instrument.color}-300`))}
          </div>
        ))}
      </div>
      <div className={'h-40 flex flex-row justify-evenly items-center absolute left-0 right-0 bottom-0'}>
        {AVAILABLE_INSTRUMENTS.filter((instrument) => MELODIES[melody][instrument.name].indexOf('x') >= 0).map((instrument) => (
          <div className="h-32 w-32 text-right">
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
          <div
            onClick={() => recordInstrument(instrument.name)}
            className={`transition-transform transform-gpu scale-${
              matchedInstruments[instrument.name] ? `110 bg-${instrument.color}-400` : `100 bg-${instrument.color}-300`
            } shadow-sm shadow-slate-500 h-32 w-32 rounded-full flex flex-col justify-center items-center group z-20`}
          >
            <img src={`${instrument.name}.png`} alt={`${instrument.name}_image`} className="object-contain h-20 w-20 mt-1" />
            {frequences[instrument.name] === 0 ? <p className="text-sm group-hover:hidden">Aufnehmen</p> : null}
            <p className="text-sm hidden group-hover:block">Aufnehmen</p>
          </div>
        ))}
      </div>
      {isRecording ? (
        <div className="fixed top-1/2 text-center w-full -mt-20 z-50">
          <p className="text-9xl text-red-600">Recording</p>
        </div>
      ) : null}
    </div>
  )
}

export default App
