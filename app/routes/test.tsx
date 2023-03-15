import { defer } from "@remix-run/node";
import { Suspense } from "react";
import { Await, useLoaderData } from "@remix-run/react";
import useSWR, { SWRConfig } from "swr";

const sleep = (ms: number = 1000) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

async function getProfile() {
  await sleep();
  return {
    firstName: "remix",
    lastName: "swr",
    status: "working",
  };
}

async function getComments() {
  await sleep(4000);
  return [
    {
      id: "1",
      text: "hello, remix",
    },
    {
      id: "2",
      text: "hello, swr",
    },
  ];
}

export const loader = async () => {
  const comments = getComments();
  const profile = await getProfile();

  return defer({
    profile,
    comments,
  });
};

export default function Test() {
  const { profile } = useLoaderData<typeof loader>();

  return (
    <SWRConfig value={{ fallback: { "/profile": profile } }}>
      <div>
        <h1>
          Hello, {profile.firstName}, {profile.lastName}.
        </h1>
        <Problem />
      </div>
    </SWRConfig>
  );
}

function useProfile() {
  const { data } = useSWR('/profile', async () => {
    await sleep(2000);
    return {
      firstName: "remix",
      lastName: "swr",
      status: "sleeping",
    }
  })

  return data;
}

function Problem() {
  const { comments } = useLoaderData<typeof loader>();
  const profile = useProfile();

  return (
    <>
      <h1>Right now, you are {profile?.status}</h1>
      <h2>Comments List</h2>
      <Suspense fallback={<div>loading comments</div>}>
        <ul>
          <Await resolve={comments}>
            {(_comments) => _comments.map((c) => <li key={c.id}>{c.text}</li>)}
          </Await>
        </ul>
      </Suspense>
    </>
  );
}
