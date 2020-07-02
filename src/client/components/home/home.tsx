import React, { useState, Dispatch, SetStateAction, useEffect } from "react";

import Sidebar from "../sidebar/Sidebar";
import AddRepos from "../addRepos/AddRepos";
import ProjectPage from "../projects/ProjectPage";
const CryptoJS = require('crypto-js');

import { Project, Repo, User } from "../../../types/types";

type HomeProps = {
  userInfo: User;
  setUserInfo: Dispatch<SetStateAction<User>>;
};

// should set type for props
const Home: React.FC<HomeProps> = ({ userInfo, setUserInfo }) => {
  // need to set type for projects/projectlist
  const [projectList, setProjectList] = useState<readonly Project[]>([]);

  const [activeProject, setActiveProject] = useState(1);

  const Request1 = async (): void => {
    //PARSE TOKEN AND USERNAME FROM COOKIES
    const nameAndToken = document.cookie.split(';');
    const username = nameAndToken[0].replace('username=', '').trim();
    const token = nameAndToken[1].replace('token=', '').trim();
    const parsedToken = decodeURIComponent((token));

    //DECRYPT TOKEN FROM COOKIES
    const decryptedToken = await CryptoJS.AES.decrypt(parsedToken, 'super_secret').toString(CryptoJS.enc.Utf8);
    const body = JSON.stringify({
      username: username,
      token: decryptedToken
    })
    console.log(username, token, ' decrypte', decryptedToken, body)
    fetch('http://localhost:3001/api/repos', {
      method: 'POST',
      body: body,
      headers: {
        'Content-Type': 'application/json'
        // 'Content-Type': 'application/x-www-form-urlencoded',
      }
  
    })
      // .then(res => res.json())
      .then(res => console.log('success', res))
      .catch(err => console.log('fail', err))
  }
  const Request2 = (): void => {
    fetch('/api/repos', {
      method: 'GET',
      credentials: 'include',
    })
      .then(res => res.json())
      .then(res => console.log('success', res))
      .catch(err => console.log('fail', err))
  }
  const Request3 = (): void => {
    fetch('/api/repos', {
      method: 'GET',
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((res) => console.log("success", res))
      .catch((err) => console.log("fail", err));
  };

  // populate list of projects, happens on render
  useEffect(() => {
    // fetch projects from local file, prob fs.readfile
    // .then set state for project list

    // dummy response
    const fetched = [
      {
        projectName: 'DockerLocal(project1)', projectId: 1, projectRepos: [
          { repoName: 'perrepop1', repoOwner: 'personallink1', repoId: 'a', isIncluded: true },
          { repoName: 'abcdefgpersonal2', repoOwner: 'personallink2', repoId: 'b', isIncluded: false },
          { repoName: 'abbsddpersonalRepo3', repoOwner: 'personallink3', repoId: 'c', isIncluded: true },
          { repoName: 'collab Repo4', repoOwner: 'collablink4', repoId: 'd', isIncluded: true },
          { repoName: 'collab Repo5', repoOwner: 'collablink5', repoId: 'e', isIncluded: false },
          { repoName: 'collab Repo6', repoOwner: 'collablink6', repoId: 'f', isIncluded: false },
        ],
      },
      {
        projectName: 'React Visualizer 2.5(project2)', projectId: 2, projectRepos: [
          { repoName: 'collab Repo4', repoOwner: 'collablink4', repoId: 'g', isIncluded: false },
          { repoName: 'collab Repo5', repoOwner: 'collablink5', repoId: 'h', isIncluded: true },
          { repoName: 'collab Repo6', repoOwner: 'collablink6', repoId: 'i', isIncluded: false },
        ]
      },
      {
        projectName: 'React Visualizer 8.5(project3)', projectId: 3, projectRepos: [
          { repoName: 'organization Repo5', repoOwner: 'orglink5', repoId: 'j', isIncluded: false },
          { repoName: 'organization Repo6', repoOwner: 'orglink6', repoId: 'k', isIncluded: false },
          { repoName: 'collab Repo1', repoOwner: 'collablink1', repoId: 'l', isIncluded: false },
          { repoName: 'collab Repo2', repoOwner: 'collablink2', repoId: 'm', isIncluded: false },
        ]
      },
      {
        projectName: 'React Visualizer 77.0(project4)', projectId: 4, projectRepos: [
          { repoName: 'organization Repo6', repoOwner: 'orglink5', repoId: 'n', isIncluded: false },
          { repoName: 'organization Repo7', repoOwner: 'orglink6', repoId: 'o', isIncluded: false },
          { repoName: 'collab Repo1', repoOwner: 'collablink1', repoId: 'p', isIncluded: false },
          { repoName: 'collab Repo2', repoOwner: 'collablink2', repoId: 'q', isIncluded: false },
        ]
      },
    ];
    setProjectList(fetched);
  }, []);

  return (
    <div>
      {/* <LoggedIn/> << logged in component at top with logout button and username*/}
      {`${userInfo.userName}`}
      <button onClick={(): void => Request1()}>DEMO Request1</button>
      <button onClick={(): void => Request2()}>DEMO Request2</button>
      <button onClick={(): void => Request3()}>DEMO Request3</button>

      <div className="columns">
        <div className="column is-one-third">
          <Sidebar
            {...{
              projectList,
              setProjectList,
              activeProject,
              setActiveProject,
            }}
          />
        </div>
        <div className="column">
          <ProjectPage
            {...{ activeProject, userInfo, projectList, setProjectList }}
          />
        </div>
      </div>
    </div>
  );
};

export default Home;
