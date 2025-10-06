import { useEffect, useState } from 'react'
import OpenAI from 'openai';
const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY
const GEMINI_URL = import.meta.env.VITE_GEMINI_URL

function App() {
  const [loading, setLoading] = useState(false)
  const [input, setInput] = useState('')
  const [data, setData] = useState([])
  const [wComment, setWComment] = useState('');
  const [lComment, setLComment] = useState('')


  const handleLoading = async () => {
  const videoId = extractVideoId(input)
  setLoading(true)
  const comments = await fetchComments(videoId)
  setData(comments)

  setLoading(false)
  setInput('')
  setLoading(false)
  }

  const extractVideoId = (url) => {
    const parts = url.split('=')
    return parts[parts.length - 1]
  }

  const fetchComments = async (videoId) => {
    console.log(YOUTUBE_API_KEY)
    const url = `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${videoId}&maxResults=5&key=${YOUTUBE_API_KEY}`
    const response = await fetch(url)
    const result = await response.json()
    return result.items.map(item => item.snippet.topLevelComment.snippet.textDisplay)
  }

  //connect google gemini ai 
  const payload = {
    "contents": [{
        "parts": [{ "text": "Analyze the positive comments and summarise all them with detail but not more than 4 lines and do the same for negative ones as well and put W in front of positive summary and L next to negative summary. Remove asteriks or any other specaial characters including the inverted commas." + data}]
      }]
    }

  const runAnaylsis = async () => {
    console.log('button being clicked')
    let res = await fetch(GEMINI_URL+'?key='+GEMINI_API_KEY, {
      method: "POST",
      body: JSON.stringify(payload)
    })
    res = await res.json()
    const analysis = res.candidates[0].content.parts[0].text
    // const wComments = await getWComments(analysis)
    extractCategories(analysis);
    console.log('W--> ' + wComment)
    console.log('L--> ' + lComment)
  }

const extractCategories = (analysis) => {
  // Split the analysis into lines
  const lines = analysis.split('\n').map(line => line.trim()).filter(Boolean);

  // Get W (positive) and L (negative) summaries
  setWComment(lines
    .filter(line => line.startsWith('W:'))
    .map(line => line.replace(/^W:\s*/, '')));

  setLComment (lines
    .filter(line => line.startsWith('L:'))
    .map(line => line.replace(/^L:\s*/, '')));
}
  


  return (
    <>
      <div className='flex flex-col justify-center items-center'>
        <div>
          <form onSubmit={e => { e.preventDefault(); handleLoading(); }} className='flex  mt-30 mb-15 justify-center'>
            <input onChange={e => setInput(e.target.value)} value={input} placeholder='Paste youtube video link...' className='text-2xl mx-5  border-4 rounded-full p-4 border-amber-300 h-15 w-[800px]' />
            <button type='submit' className='text-black text-2xl font-bold cursor-pointer bg-amber-300 rounded-full border-b-black w-60 h-15'>Generate</button>
          </form>
        </div>
        {loading ? <div>
          <svg className='w-12 h-12' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><radialGradient id="a12" cx=".66" fx=".66" cy=".3125" fy=".3125" gradientTransform="scale(1.5)"><stop offset="0" stopColor="#FFD54F"></stop><stop offset=".3" stopColor="#FFD54F" stopOpacity=".9"></stop><stop offset=".6" stopColor="#FFD54F" stopOpacity=".6"></stop><stop offset=".8" stopColor="#FFD54F" stopOpacity=".3"></stop><stop offset="1" stopColor="#FFD54F" stopOpacity="0"></stop></radialGradient><circle transformOrigin="center" fill="none" stroke="url(#a12)" strokeWidth="15" strokeLinecap="round" strokeDasharray="200 1000" strokeDashoffset="0" cx="100" cy="100" r="70"><animateTransform type="rotate" attributeName="transform" calcMode="spline" dur="2" values="360;0" keyTimes="0;1" keySplines="0 0 1 1" repeatCount="indefinite"></animateTransform></circle><circle transformOrigin="center" fill="none" opacity=".2" stroke="#FFD54F" strokeWidth="15" strokeLinecap="round" cx="100" cy="100" r="70"></circle></svg>
        </div> : <></>}
        <div>
          <div className='flex mt-15'>
            {/* <button onClick={askQuestion}>hiii</button> */}
            <div className='mx-5 p-4 rounded-xl align-middle h-3xl w-[300px] bg-amber-300 text-black'>

               <div className="mb-4">
    <p className="font-bold">W:</p>
    <p>{wComment}</p>
  </div>
            </div>
            <div className='mx-5 p-4 rounded-xl align-middle h-3xl w-[300px] bg-amber-300 text-black'>
            </div><div className='mx-5 p-4 rounded-xl align-middle h-3xl w-[300px] bg-amber-300 text-black'>
              <div className="mb-4">
    <p className="font-bold">L:</p>
              <p>
                {lComment}
              </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default App
