import { Button } from 'flowbite-react'
import React from 'react'
import { AiFillGoogleCircle } from 'react-icons/ai'
import {GoogleAuthProvider, signInWithPopup, getAuth} from 'firebase/auth'
import { app } from '../firebase'
import { useDispatch } from 'react-redux'
import { signInSuccess } from '../redux/user/userSlice'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const OAuth = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate()
    const auth = getAuth(app);

    const handleGoogleClick = async()=>{
      // creating provider
      const provider = new GoogleAuthProvider();
      // setting parameters -> each time ask to select account 
      provider.setCustomParameters({prompt: 'select_account'})
      try{
        const resultsFromGoogle = await signInWithPopup(auth,provider);
        // console.log(resultsFromGoogle)
        const res = await axios.post('/api/auth/google',{
          name: resultsFromGoogle.user.displayName,
          email: resultsFromGoogle.user.email,
          googlePhotoUrl: resultsFromGoogle.user.photoURL
        },{
          headers: {'Content-Type': 'application/json'}
        })
        const data = await res.data;
        // console.log(data)
        if(res.status==200){
          dispatch(signInSuccess(data));
          navigate('/');
        }
      } catch(error){
        // console.log(error)
      } 
    }
  return (
    <Button type='button' gradientDuoTone='pinkToOrange' outline onClick={handleGoogleClick}>
        <AiFillGoogleCircle className='w-6 h-6 mr-2' />
        Continue with Google
    </Button>
  )
}

export default OAuth