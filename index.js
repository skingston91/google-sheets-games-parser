import {readFile} from 'fs'
import {promisify} from 'util'
import neatCsv from 'neat-csv'
import csvWriter from 'csv-writer'

import fetch from 'node-fetch'
  
const asyncReadFile = promisify(readFile);
const csvFileLocation = './Games Owned - Sheet1.csv'

const getData = async (url) => {
    try {
      const response = await fetch(url);
      const json = await response.json();
      return json
    } catch (error) {
      console.log(error);
    }
  };

const indexFunction = async () => {
    const csv = await asyncReadFile(csvFileLocation)
    const gamesFinished = await neatCsv(csv);
    const formattedData = reformatData(gamesFinished) // tidy up the data and make it nicer
    console.log(formattedData)
    // then potenially enrich the data
    // Spilt the data into different JSON files perhaps? Games Finished and Games Owned
    // then put the data into a json format we want to read in
    // const contentCSVHeaders = generateCSVHeaders(keyedGameContent)
    // writeFile('keyedContent', contentCSVHeaders, keyedGameContent)
}

const normalizeTextToCompare = (string="") => {
    return string && string.toLowerCase().trim()
}

const santisedIntl = (intlDataValue) => {
    return Object.keys(intlDataValue).reduce((accum, key) => {
        const value = intlDataValue[key]
        return {
            ...accum,
            [key]: santiseValues(value)
        }
    }, {})
}

/*
    {
    Game: 'Cybershadow',
    'Quantity ': '0',
    Finished: 'Yes',
    Location: '',
    Console: 'Xbox One',
    Owner: 'Steven',
    Boxed: '',
    Digital: 'Yes',
    'Date Completed': '13/04/2021 12:13:00',
    Comments: "It's a fun game, hard but fun. Good one of those"
    }
*/

const capitalize = (string) => {
  if (typeof string !== 'string') return ''
  const splitWords = string.split(' ')
  const cappedWords = splitWords.map((word) => {
    return word.charAt(0).toUpperCase() + word.slice(1)
  }) 
  return cappedWords.join(' ')
}

const formatDate = (date) => {
    const [dateWithoutTime, timeWithoutDate = ""] = date.split(' ') 
    const month = dateWithoutTime.split('/')[1] - 1
    const day = dateWithoutTime.split('/')[0]
    const year = dateWithoutTime.split('/')[2]
    const hours = timeWithoutDate.split(':')[0] || '00'
    const minutes = timeWithoutDate.split(':')[1] || '00'
    const seconds = timeWithoutDate.split(':')[2] || '00'
    return new Date(year, month, day,hours, minutes, seconds) 
}
const reformatData = (gamesFinished) => {
    console.log('REFORMATTING');
    return gamesFinished.map((game) => {
        Object.entries(game).map(([key, value]) => {
            const trimmedValue = value && value.trim()
            if(key === 'Comments') game[key] = trimmedValue || ""
            if(key === 'Date Completed') {
                if(!value) game[key] = ""
                else game[key] = formatDate(trimmedValue)
            } 
            else game[key]= capitalize(trimmedValue)
        })
        return game
    })
}

// Each section which is one of us needs to be commented in and out for each run else it outputs to one file
const extractContentFields = (games) => {
    const extractedContent = games.map(({elevator_pitch, legal_notices, _id, pre_load, challenges}) => {
        const challengeInfo = challenges && challenges.reduce((accum, {challenge_data}) => { 
            const {text, title, _id: challengeId } = challenge_data
            const key = `${_id}${challengeId.trim()}`
            // if (text) { // BUG - can only do one at the time as they only have one id // (one at a time)
            //     accum[key] = text && text.trim()
            //     return accum  
            // }
            if(title) {// BUG - can only do one at the time as they only have one id // (one at a time)
                accum[key] = title && title.trim()
                return accum  
            }
        }, {})
        const preloadedData = pre_load && 
        pre_load.reduce((accum, { content, feature}) => {   // HOTFIX - only extract one element else as we need to manually put them into the right files at the moment
                const key = `${_id}-${feature}`
                // if (feature === "help-full") { //spilt into seperate if to have easier feature (one at a time)
                //     accum[key] = content
                //     return accum
                // }
                // if (feature === "trivia") { // one at a time 
                //     accum[key] = content
                //     return accum
                // }
                return accum
            }, {})
        const newData = {
            // [`${_id}-elevator_pitch`]: elevator_pitch && elevator_pitch.trim(), // (one at a time)
            // [`${_id}-legal_notices`]: legal_notices && legal_notices.trim(), //(one at a time)
            // ...preloadedData // (one at a time)
            ...challengeInfo //(one at a time)
        }
        return newData
    })
    return extractedContent;
}

const extractGameTitles = (games) => {
    const extractedContent = games.map(({title, _id, }) => {
        return {
            [`${_id}-title`]: title && title.trim(),
        }
    })
    // console.log(extractGameTitles)
    return extractedContent
}

const generateCSVHeaders = (data) => {
    const firstData = data && data[0];
    if(!firstData) return
    return Object.keys(firstData).map((headerValue) => {
        return {
            id: headerValue,
            title: headerValue,
        }
    })
}

const writeFile = (fileName, headers, data) => {
    if(!data) {
        console.log("No Matches to write")
        return 
    }
    const csvWriterInstance = csvWriter.createObjectCsvWriter({
        path: `\output\/games/${fileName}.csv`,
        header: headers,
      });
      csvWriterInstance
    .writeRecords(data)
    .then(()=> console.log(`The CSV file ${fileName} was written successfully`));
}

indexFunction();


