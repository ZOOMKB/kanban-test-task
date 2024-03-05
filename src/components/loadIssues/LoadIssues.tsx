import React, { useState } from 'react';
import axios from 'axios';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

import './loadIssues.scss';

interface RepoInfo {
  name: string;
  owner: string;
  stars: number;
}

interface Props {
  setUrl: React.Dispatch<React.SetStateAction<string>>;
}

const LoadIssues: React.FC<Props> = ({ setUrl }) => {
  const [repoUrl, setRepoUrl] = useState<string>('');
  const [repoInfo, setRepoInfo] = useState<RepoInfo | null>(null);

  const fetchData = async () => {
    if (!repoUrl) {
      return null;
    }

    if (repoUrl.includes('https://github.com/')) {
      try {
        const url = repoUrl.replace('https://github.com/', '');
        const response = await axios.get(`https://api.github.com/repos/${url}`);
        setRepoInfo({
          name: response.data.name,
          owner: response.data.owner.login,
          stars: response.data.stargazers_count
        });
        setUrl(url);
      } catch (error) {
        console.error('Error fetching repository information:', error);
      }
    } else {
      return null;
    }
  }

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    fetchData();
  }

  return (
    <div className="loadIssues">
      <Form onSubmit={handleFormSubmit} className="loadIssues__form">
        <Form.Control
          type="text"
          placeholder="Enter repository URL"
          value={repoUrl}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRepoUrl(e.target.value)}
        />
        <Button variant="outline-dark" type="submit" className="loadIssues__form-btn">Submit</Button>
      </Form>
      <div className="loadIssues__info">
        {repoInfo && (
            <a href={repoUrl} target="_blank" rel="noreferrer">{`${repoInfo.owner} > ${repoInfo.name}`}</a>
        )}
        <div className="loadIssues__info-stars"></div>
      </div>
    </div>
  );
};

export default LoadIssues;
