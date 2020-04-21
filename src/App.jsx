const issues = [
    {
        id: 1, status: 'New', owner: 'Ravan', effort: 5,
        created: new Date('2018-08-15'), due: undefined,
        title: 'Error in console when clicking Add',
    },
    {
        id: 2, status: 'Assigned', owner: 'Eddie', effort: 14,
        created: new Date('2018-08-16'), due: new Date('2018-08-30'),
        title: 'Missing bottom border on panel',
    },
    {
        id: 3, status: 'Closed', owner: 'Sandro', effort: 1,
        created: new Date('2020-04-20'), due: new Date('2020-04-20'),
        title: 'Home page grid of article filter does not work',
    }
];

class IssueList extends React.Component {

    render() {
        return (
            <React.Fragment>
                <h1>Issue Tracker</h1>
                <IssueFilter/>
                <hr/>
                <IssueTable/>
                <hr/>
                <IssueAdd/>
            </React.Fragment>
        );
    }

}

class IssueFilter extends React.Component {
    render() {
        return (
            <div>This is a placeholder for the issue filter.</div>
        );
    }
}
class IssueTable extends React.Component {
    render() {
        const issueRows = issues.map(issue => <IssueRow key={issue.id} issue={issue} />) 
        return (
            <table className="bordered-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Status</th>
                        <th>Owner</th>
                        <th>Created</th>
                        <th>Effort</th>
                        <th>Due date</th>
                        <th>Title</th>
                    </tr>
                </thead>
                <tbody>
                    {issueRows}
                </tbody>
            </table>
        );
    }
}

class IssueAdd extends React.Component {
    render() {
        return (
            <div>This is a placeholder for a form to add an issue.</div>
        );
    }
}

class IssueRow extends React.Component {
    render() {
        const issue = this.props.issue;
        return (
        <tr>
            <td>{issue.id}</td>
            <td>{issue.status}</td>
            <td>{issue.owner}</td>
            <td>{issue.created.toDateString()}</td>
            <td>{issue.effort}</td>
            <td>{issue.due ? issue.due.toDateString() : ''}</td>
            <td>{issue.title}</td>
        </tr>
        );
    }
}

const element = <IssueList/>;
ReactDOM.render(element, document.getElementById('contents'));