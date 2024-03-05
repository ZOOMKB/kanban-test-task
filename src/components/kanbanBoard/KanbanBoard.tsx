import React, { useEffect, useState } from 'react';
import axios from 'axios';

import './kanbanBoard.scss';

interface Issue {
  id: number;
  title: string;
  updated_at: string;
  user: {
    login: string;
  };
  comments: number;
}

interface Props {
  url: string;
}

const KanbanBoard: React.FC<Props> = ({ url }) => {
  const [todoIssues, setTodoIssues] = useState<Issue[]>([]);
  const [inProgressIssues, setInProgressIssues] = useState<Issue[]>([]);
  const [doneIssues, setDoneIssues] = useState<Issue[]>([]);

  useEffect(() => {
    const fetchIssues = async () => {
      const _defUrl = `https://api.github.com/repos/${url}`;

      try {
        const [todoResponse, inProgressResponse, doneResponse] = await Promise.all([
          axios.get(`${_defUrl}/issues?state=open&assignee=none`),
          axios.get(`${_defUrl}/issues?state=open&assignee`),
          axios.get(`${_defUrl}/issues?state=closed`)
        ]);

        setTodoIssues(todoResponse.data);
        setInProgressIssues(inProgressResponse.data);
        setDoneIssues(doneResponse.data);

      } catch (error) {
        console.error('Error fetching issues:', error);
      }
    }

    fetchIssues();
  }, [url]);

  const handleDragStart = (event: React.DragEvent<HTMLLIElement>, issueId: number, column: string) => {
    event.dataTransfer.setData('issueId', issueId.toString());
    event.dataTransfer.setData('column', column);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>, column: string) => {
    event.preventDefault();
    const issueId = Number(event.dataTransfer.getData('issueId'));
    const fromColumn = event.dataTransfer.getData('column');

    if (fromColumn !== column) {
      const updatedFromColumn = fromColumn === 'todo' ? todoIssues.slice() : fromColumn === 'inProgress' ? inProgressIssues.slice() : doneIssues.slice();
      const fromColumnSetter = fromColumn === 'todo' ? setTodoIssues : fromColumn === 'inProgress' ? setInProgressIssues : setDoneIssues;
      const fromIndex = updatedFromColumn.findIndex(issue => issue.id === issueId);
      const [draggedIssue] = updatedFromColumn.splice(fromIndex, 1);

      const toColumnSetter = column === 'todo' ? setTodoIssues : column === 'inProgress' ? setInProgressIssues : setDoneIssues;
      toColumnSetter(prevState => [...prevState, draggedIssue]);

      fromColumnSetter(updatedFromColumn);
    } else {
      const updatedColumn = column === 'todo' ? todoIssues.slice() : column === 'inProgress' ? inProgressIssues.slice() : doneIssues.slice();
      const columnSetter = column === 'todo' ? setTodoIssues : column === 'inProgress' ? setInProgressIssues : setDoneIssues;
      const fromIndex = updatedColumn.findIndex(issue => issue.id === issueId);
      const [draggedIssue] = updatedColumn.splice(fromIndex, 1);
      const toIndex = Number(event.currentTarget.dataset.index);

      updatedColumn.splice(toIndex, 0, draggedIssue);
      columnSetter(updatedColumn);
    }
  };

  const allowDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  return (
    <div className="kanbanBoard">
      <div className="kanbanBoard__columns" onDrop={event => handleDrop(event, 'todo')} onDragOver={allowDrop}>
        <h4 className="kanbanBoard__columns-status">toDo</h4>
        <KanbanColumn issues={todoIssues} column="todo" handleDragStart={handleDragStart} />
      </div>
      <div className="kanbanBoard__columns" onDrop={event => handleDrop(event, 'inProgress')} onDragOver={allowDrop}>
        <h4 className="kanbanBoard__columns-status">in Progress</h4>
        <KanbanColumn issues={inProgressIssues} column="inProgress" handleDragStart={handleDragStart} />
      </div>
      <div className="kanbanBoard__columns" onDrop={event => handleDrop(event, 'done')} onDragOver={allowDrop}>
        <h4 className="kanbanBoard__columns-status">Done</h4>
        <KanbanColumn issues={doneIssues} column="done" handleDragStart={handleDragStart} />
      </div>
    </div>
  );
};

interface KanbanColumnProps {
  issues: Issue[];
  column: string;
  handleDragStart: (event: React.DragEvent<HTMLLIElement>, issueId: number, column: string) => void;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({ issues, column, handleDragStart }) => (
  <ul>
    {issues.map((issue, index) => (
      <li
        className="kanbanBoard__columns-box"
        key={issue.id}
        draggable
        onDragStart={event => handleDragStart(event, issue.id, column)}
        data-index={index}
      >
        <h5>{issue.title}</h5>
        <p>Opened {daysParse(issue.updated_at)} days ago</p>
        <p>{issue.user.login} | Comments: {issue.comments}</p>
      </li>
    ))}
  </ul>
);

const daysParse = (date: string) => {
  const lastUpdated = new Date(date);
  const currentDate = new Date();
  const timeDifference = Math.abs(currentDate.getTime() - lastUpdated.getTime());
  const daysDifference = Math.ceil(timeDifference / (1000 * 3600 * 24));

  return daysDifference;
};

export default KanbanBoard;
