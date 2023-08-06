import * as React from 'react'
import { Box, Button, Divider, Grid, Tab, Tabs, TextField, ToggleButton, ToggleButtonGroup } from '@mui/material'
import { useEffect, useState } from 'react'
import { addReport } from 'db/connector'
import ScoringTable from './ScoringTable'

type ScoutReport = {
  teamNumber: string,
  alliance: string,
  eventName: string,
  match: string
}

export type ScoringGrid = {
  cone_1_1: boolean,
  cube_1_2: boolean,
  cone_1_3: boolean,
  cone_1_4: boolean,
  cube_1_5: boolean,
  cone_1_6: boolean,
  cone_1_7: boolean,
  cube_1_8: boolean,
  cone_1_9: boolean,

  cone_2_1: boolean,
  cube_2_2: boolean,
  cone_2_3: boolean,
  cone_2_4: boolean,
  cube_2_5: boolean,
  cone_2_6: boolean,
  cone_2_7: boolean,
  cube_2_8: boolean,
  cone_2_9: boolean,

  cobe_3_1: boolean,
  cobe_3_2: boolean,
  cobe_3_3: boolean,
  cobe_3_4: boolean,
  cobe_3_5: boolean,
  cobe_3_6: boolean,
  cobe_3_7: boolean,
  cobe_3_8: boolean,
  cobe_3_9: boolean
}

export type ScoreSheet = {
  grid: ScoringGrid,

  misses: {
    cone_high: number,
    cone_mid: number,
    cone_low: number,
    cube_high: number,
    cube_mid: number,
    cube_low: number
  }

  intakes: {
    single_grabbed: number,
    single_missed: number,
    double_grabbed: number,
    double_missed: number,
    floor_grabbed: number,
    floor_missed: number
  }

  charging: ChargingMode
}

enum ChargingMode {
  None,
  Attempted,
  Community, // Taxied in Auto, Parked in Endgame
  Docked,
  Engaged
}

let defaultScore: ScoreSheet = {
  grid: {
    cone_1_1: false,
    cube_1_2: false,
    cone_1_3: false,
    cone_1_4: false,
    cube_1_5: false,
    cone_1_6: false,
    cone_1_7: false,
    cube_1_8: false,
    cone_1_9: false,

    cone_2_1: false,
    cube_2_2: false,
    cone_2_3: false,
    cone_2_4: false,
    cube_2_5: false,
    cone_2_6: false,
    cone_2_7: false,
    cube_2_8: false,
    cone_2_9: false,

    cobe_3_1: false,
    cobe_3_2: false,
    cobe_3_3: false,
    cobe_3_4: false,
    cobe_3_5: false,
    cobe_3_6: false,
    cobe_3_7: false,
    cobe_3_8: false,
    cobe_3_9: false,
  },

  misses: {
    cone_high: 0,
    cone_mid: 0,
    cone_low: 0,
    cube_high: 0,
    cube_mid: 0,
    cube_low: 0
  },

  intakes: {
    single_grabbed: 0,
    single_missed: 0,
    double_grabbed: 0,
    double_missed: 0,
    floor_grabbed: 0,
    floor_missed: 0
  },

  charging: ChargingMode.None
}

export type ScoreData = {
  total_score: number
  auto_score: ScoreSheet,
  tele_score: ScoreSheet
}

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  )
}

export default function ScoutForm() {  
  const [scoutInfo, setScoutInfo] = useState<ScoutReport>({
    teamNumber: '',
    alliance: '',
    eventName: '',
    match: ''
  })

  const handleAllianceChange = (
    event: React.MouseEvent<HTMLElement>,
    newAlliance: string,
  ) => {
    setScoutInfo({
      ...scoutInfo,
      alliance: newAlliance
    })
  }

  const [totalScore, setTotalScore] = useState(0)
  const [autoScore, setAutoScore] = useState<ScoreSheet>(defaultScore)
  const [teleScore, setTeleScore] = useState<ScoreSheet>(defaultScore)

  useEffect(() => {
    const calcScore = () => {
      let tempScore = 0
      Object.values(autoScore.grid).forEach((value: boolean, index: number) => {
        if (index < 9 && value) tempScore += 6
        if (index >= 9 && index < 18 && value) tempScore += 4
        if (index >= 18 && value) tempScore += 3
      })
      Object.values(teleScore.grid).forEach((value: boolean, index: number) => {
        if (index < 9 && value) tempScore += 5
        if (index >= 9 && index < 18 && value) tempScore += 3
        if (index >= 18 && value) tempScore += 2
      })
      let linkCounter = 0
      for (let i = 0; i < 27; i++) {
        if (Object.values(autoScore.grid)[i] || Object.values(teleScore.grid)[i]) linkCounter++
        if (linkCounter === 3) {
          tempScore += 5
          linkCounter = 0
        }
        if (i === 8 || i === 17) linkCounter = 0
      }
  
      if(autoScore.charging === ChargingMode.Community) tempScore += 3
      else if(autoScore.charging === ChargingMode.Docked) tempScore += 8
      else if(autoScore.charging === ChargingMode.Engaged) tempScore += 12
      if(teleScore.charging === ChargingMode.Community) tempScore += 2
      else if(teleScore.charging === ChargingMode.Docked) tempScore += 6
      else if(teleScore.charging === ChargingMode.Engaged) tempScore += 10
  
      return tempScore
    }
    setTotalScore(calcScore())
  }, [autoScore, teleScore])

  const submitReport = async () => {
    if (!process.env.REACT_APP_TEAM_NUMBER) return
    let body = {
      reporting_team: process.env.REACT_APP_TEAM_NUMBER,
      alliance: scoutInfo.alliance,
      event: scoutInfo.eventName,
      match: scoutInfo.match,
      scouted_team: scoutInfo.teamNumber,
      auto_score: autoScore,
      tele_score: teleScore
    }
    await addReport(body)
    alert("Report added!")
  }

  const [value, setValue] = React.useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue)
  }

  return (
    <React.Fragment>
      <Grid px={3} justifyContent="center" container spacing={2}>
        <Grid item xs={12}>
          <h1>Scouting Sheet</h1>
        </Grid>
        { /* Team Number */}
        <Grid container>
          <Grid item xs={12}>
            <TextField
              variant="outlined"
              label="Team Number"
              placeholder="1234"
              type="number"
              onChange={e => setScoutInfo({...scoutInfo, teamNumber: e.target.value})}
              value={scoutInfo.teamNumber}
              fullWidth
            />
          </Grid>
        </Grid>
        { /* Event and Match */}
        <Grid item xs={12}><Divider /></Grid>
        <Grid container>
          <Grid item xs={6}>
            <TextField
              variant="outlined"
              label="Event"
              placeholder="Asheville District Event"
              onChange={e => setScoutInfo({...scoutInfo, eventName: e.target.value})}
              value={scoutInfo.eventName}
              fullWidth
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              variant="outlined"
              label="Match Number"
              placeholder="Q22"
              onChange={e => setScoutInfo({...scoutInfo, match: e.target.value})}
              value={scoutInfo.match}
              fullWidth
            />
          </Grid>
        </Grid>
        <Grid item xs={12}><Divider /></Grid>
        { /* Alliance */ }
        <Grid item xs={12}>
          <ToggleButtonGroup
            value={scoutInfo.alliance}
            exclusive
            size="large"
            onChange={handleAllianceChange}
            fullWidth
          >
            <ToggleButton color="error" value="red1">Red 1</ToggleButton>
            <ToggleButton color="error" value="red2">Red 2</ToggleButton>
            <ToggleButton color="error" value="red3">Red 3</ToggleButton>
            <ToggleButton color="primary" value="blue1">Blue 1</ToggleButton>
            <ToggleButton color="primary" value="blue2">Blue 2</ToggleButton>
            <ToggleButton color="primary" value="blue3">Blue 3</ToggleButton>
          </ToggleButtonGroup>
        </Grid>
        <Grid item xs={12}><Divider /></Grid>
        { /* Scoring */ }
        <Grid item xs={12} mb={2}>
          <TextField
            variant="outlined"
            label="Points"
            type="number"
            value={totalScore}
            fullWidth
            InputProps={{
              readOnly: true
            }}
          />
        </Grid>
        <Box sx={{ width: '100%' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={value} onChange={handleChange} variant="fullWidth">
              <Tab label="Autonomous" />
              <Tab label="Teleop" />
            </Tabs>
          </Box>
          <CustomTabPanel value={value} index={0}>
            <ScoringTable key={0} score={autoScore} setScore={setAutoScore}/>
          </CustomTabPanel>
          <CustomTabPanel value={value} index={1}>
            <ScoringTable key={1} score={teleScore} setScore={setTeleScore} autoScore={autoScore} teleop/>
          </CustomTabPanel>
        </Box>
        { /* Submit */ }
        <Grid item xs={12}>
          <Button sx={{minHeight: 50}} variant="contained" color="success" fullWidth
            onClick={submitReport}
          >Submit</Button>
        </Grid>
      </Grid>
    </React.Fragment>
  )
}