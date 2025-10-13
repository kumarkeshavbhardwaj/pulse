import { useEffect, useState } from 'react'
import OpenAI from 'openai';
const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY
const GEMINI_URL = import.meta.env.VITE_GEMINI_URL

function App() {


  const [loading, setLoading] = useState(false)
  const [input, setInput] = useState('')
  const [data, setData] = useState([])
  const [majComment, setMajComment] = useState('')
  const [minComment, setMinComment] = useState('')
  const [oddComment, setOddComment] = useState('')



  const handleLoading = async () => {
  const videoId = extractVideoId(input)
  setLoading(true)
  await fetchComments(videoId)
  // runAnaylsis()
  setLoading(false)
  setInput('')
  }

  const extractVideoId = (url) => {
    const parts = url.split('=')
    return parts[parts.length - 1]
  }

  const fetchComments = async (videoId) => {
    console.log('fetch comments init')
    console.log(YOUTUBE_API_KEY)
    const url = `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${videoId}&maxResults=50&key=${YOUTUBE_API_KEY}`
    const response = await fetch(url)
    const result = await response.json()
    const com = await result.items.map(item => item.snippet.topLevelComment.snippet.textDisplay)
    setData(com)
    console.log(`com - ${com}`)
    console.log(`data - ${data}`)

  }

   useEffect(() => {
     if (data.length > 0) {
    runAnaylsis();
  }
  console.log('Updated data:', data)
}, [data])

  //connect google gemini ai 
  const majPayload = {
    "contents": [{
        "parts": [{ "text": "You are an expert social media analyst. Analyze the following YouTube comments and Identify and summarize the **majority opinion** — what most of the comments convey or what they mean within 4 lines and also do not use any special character in your response including asterisk. Also remember do not quote the comment as it is, please summarise it in the best way possible. " + data}]
      }]
    }

     const minPayload = {
    "contents": [{
        "parts": [{ "text": "You are an expert social media analyst. Analyze the following YouTube comments and Identify and summarize the **minority opinion** — the less common but noticeable viewpoint within 4 lines and also do not use any special character in your response including asteriskm. Also remember do not quote the comment as it is, please summarise it in the best way possible. " + data}]
      }]
    }
    
    const oddPayload = {
      "contents": [{
        "parts": [{ "text": "You are an expert social media analyst. Analyze the following YouTube comments and Identify and summarize **weird or unique takes** within 4 lines and also do not use any special character in your response including asterisk. Also remember do not quote the comment as it is, please summarise it in the best way possible. " + data}]
      }]
    }

  const runAnaylsis = async () => {
    console.log('run analysis init')
    let majRes = await fetch(GEMINI_URL+'?key='+GEMINI_API_KEY, {
      method: "POST",
      body: JSON.stringify(majPayload)
    })
    majRes = await majRes.json()
    setMajComment(majRes.candidates[0].content.parts[0].text)

    let minRes = await fetch(GEMINI_URL+'?key='+GEMINI_API_KEY, {
      method: "POST",
      body: JSON.stringify(minPayload)
    })
    minRes = await minRes.json()
    setMinComment(minRes.candidates[0].content.parts[0].text)

    let oddRes = await fetch(GEMINI_URL+'?key='+GEMINI_API_KEY, {
      method: "POST",
      body: JSON.stringify(oddPayload)
    })
    oddRes = await oddRes.json()
    setOddComment(oddRes.candidates[0].content.parts[0].text)

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
    <p className="font-bold">What majority thinks: </p>
    <p>{majComment}</p>
  </div>
            </div>
            <div className='mx-5 p-4 rounded-xl align-middle h-3xl w-[300px] bg-amber-300 text-black'>
                  <p className="font-bold">What minority thinks:</p>
                  <p>
                {minComment}
              </p>

            </div><div className='mx-5 p-4 rounded-xl align-middle h-3xl w-[300px] bg-amber-300 text-black'>
              <div className="mb-4">
    <p className="font-bold">Weird take:</p>
    <p>
                {oddComment}
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
