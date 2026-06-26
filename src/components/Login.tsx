import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function Login() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const login = async () => {

    const { error } = await supabase.auth.signInWithPassword({

      email,

      password,

    });

    if (error) {

      alert(error.message);

    }

  };

  return (

    <div className="min-h-screen flex items-center justify-center bg-slate-100">

      <div className="bg-white rounded-xl shadow-xl p-8 w-96">

        <h1 className="text-3xl font-bold text-center mb-2">

          ☀️ Anaya Solar CRM

        </h1>

        <p className="text-center text-gray-500 mb-6">

          Login to continue

        </p>

        <input

          className="border rounded-lg w-full p-3 mb-4"

          placeholder="Email"

          value={email}

          onChange={(e)=>setEmail(e.target.value)}

        />

        <input

          type="password"

          className="border rounded-lg w-full p-3 mb-4"

          placeholder="Password"

          value={password}

          onChange={(e)=>setPassword(e.target.value)}

        />

        <button

          onClick={login}

          className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-lg p-3"

        >

          Login

        </button>

      </div>

    </div>

  );

}