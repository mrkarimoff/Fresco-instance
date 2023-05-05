"use client";

import { useQueryClient } from "@tanstack/react-query";
import { handleSubmit } from "~/app/signup/_actions";
import Button from "~/ui/components/Button";
import { useState } from "react";

export const SignUp: React.FC = () => {
  const queryClient = useQueryClient();
  const [userCredentials, setUserCredentials] = useState({name: '', email: '', password: ''})

  const doSubmit = async (e: FormData) => {
    e.append('name', userCredentials.name);
    e.append('email', userCredentials.email);
    e.append('password', userCredentials.password);
    console.log('formdata', e);
    // handleSubmit is a server action.
    const result = await handleSubmit(e);
    console.log('userCredentials', userCredentials);
    

    console.log("result", result);
    // ...handle form submission result.

    // invalidate the query cache, so the table updates.
    await queryClient.invalidateQueries(["users"]);
  };

  return (
    <form className="w-full max-w-lg" action={doSubmit}>
      <div className="-mx-3 mb-6 flex flex-wrap">
        <div className="mb-6 w-full px-3 md:mb-0">
          <label
            className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-700"
            htmlFor="grid-first-name"
          >
            Full Name
          </label>
          <input
            className="mb-3 block w-full appearance-none rounded border border-gray-200 bg-gray-200 px-4 py-3 leading-tight text-gray-700 focus:bg-white focus:outline-none"
            id="grid-first-name"
            type="text"
            placeholder="Jane"
            value={userCredentials.name}
            onChange={(e) => setUserCredentials({...userCredentials, name: e.target.value})}
          />
        </div>
      </div>
      <div className="-mx-3 mb-6 flex flex-wrap">
        <div className="w-full px-3">
          <label
            className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-700"
            htmlFor="grid-email"
          >
            E-Mail Address
          </label>
          <input
            className="mb-3 block w-full appearance-none rounded border border-gray-200 bg-gray-200 px-4 py-3 leading-tight text-gray-700 focus:border-gray-500 focus:bg-white focus:outline-none"
            id="grid-email"
            type="email"
            placeholder="you@somewhere.edu"
            value={userCredentials.email}
            onChange={(e) => setUserCredentials({...userCredentials, email: e.target.value})}
          />
        </div>
      </div>
      <div className="-mx-3 mb-6 flex flex-wrap">
        <div className="w-full px-3">
          <label
            className="mb-2 block text-xs font-bold uppercase tracking-wide text-gray-700"
            htmlFor="grid-password"
          >
            Password
          </label>
          <input
            className="mb-3 block w-full appearance-none rounded border border-gray-200 bg-gray-200 px-4 py-3 leading-tight text-gray-700 focus:border-gray-500 focus:bg-white focus:outline-none"
            id="grid-password"
            type="password"
            placeholder="******************"
            value={userCredentials.password}
            onChange={(e) => setUserCredentials({...userCredentials, password: e.target.value})}
          />
          <p className="text-xs italic text-gray-600">
            Make it as long and as crazy as you'd like
          </p>
        </div>
      </div>
      <div className="-mx-3 mb-6 flex flex-wrap">
        <div className="w-full px-3">
          <Button>Submit</Button>
        </div>
      </div>
    </form>
  );
};
