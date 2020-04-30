const dateRegex = new RegExp('^\\d\\d\\d\\d-\\d\\d-\\d\\d');

function jsonDateReviver(key, value) {
    if (dateRegex.test(value)) {
        return new Date(value);
    }
    return value;
}

// Utility function that handles API calls and reports errors
// errors can be transport errors due to network problems
async function graphQLFetch (query, variables = {}) {
    
    // All transport error will be thrown from withing
    // the call to fetch. So we wrap the call to fetch
    // and subsequent retrieval of the body and parse 
    // within a try-catch block
    try {
        const response = await fetch('/graphql', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json'},
            body: JSON.stringify({query, variables})
        });
        const body = await response.text();
        const result = JSON.parse(body, jsonDateReviver);

        if (result.errors) {
            const error = result.errors[0];
            if (error.extensions.code == 'BAD_USER_INPUT') {
                const details = error.extensions.exception.errors.join('\n');
                alert(`${error.message}:\n ${details}`);
            } else {
                alert(`${error.extensions.code}: ${error.message}`);
            }
        }
        return result.data;
    } catch (e) {
        alert(`Error in sending data to the server : ${e.message}`);
    }
}

class IssueList extends React.Component {

    constructor() {
        super();
        this.state = {issues: []};
        this.createIssue = this.createIssue.bind(this);
    }

    render() {
        return (
            <React.Fragment>
                <h1>Issue Tracker</h1>
                <IssueFilter/>
                <hr/>
                <IssueTable issues={this.state.issues}/>
                <hr/>
                <IssueAdd createIssue={this.createIssue}/>
            </React.Fragment>
        );
    }
    componentDidMount() {
        this.loadData();
    }
    

    async loadData() {
        
        const query = `query {
            issueList {
                id title status owner created effort due
            }
        }`;
        
        // call the graphQLFetch utility function to send a 
        // query, and if it returns a data set the state of
        // the component
        const data = await graphQLFetch(query);
        if (data) {
            this.setState({ issues: data.issueList })
        }
    }

    async createIssue(issue) {

        const query = `mutation issueAdd($issue: IssueInputs!) {
            issueAdd(issue: $issue) {
                id
            }
        }`;       
        const data = await graphQLFetch(query, { issue });
        if (data) {
            this.loadData();
        }
        
    }
}

class IssueFilter extends React.Component {
    render() {
        return (
            <div>This is a placeholder for the issue filter.</div>
        );
    }
}
function IssueTable(props) {

        const issueRows = props.issues.map(issue => <IssueRow key={issue.id} issue={issue} />) 
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

class IssueAdd extends React.Component {

    constructor() {
        super();
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    render() {
        return (
            <form name="issueAdd" onSubmit={this.handleSubmit}>
                <input type="text" name="owner" placeholder="Owner" />
                <input type="text" name="title" placeholder="Title"/>
                <button>Add</button>
            </form>
        );
    }

    handleSubmit(e) {
        e.preventDefault();
        const form = document.forms.issueAdd;
        const issue = {
            owner: form.owner.value, 
            title: form.title.value, 
            due: new Date(new Date().getTime() + 1000*60*60*24*10)
        }
        this.props.createIssue(issue);
        form.owner.value = "";
        form.title.value = "";

    }
}

function IssueRow(props) {
    
        const issue = props.issue;
        return (
        <tr>
            <td>{issue.id}</td>
            <td>{issue.status}</td>
            <td>{issue.owner}</td>
            <td>{issue.created.toDateString()}</td>
            <td>{issue.effort}</td>
            <td>{issue.due ? issue.due.toDateString() : ' ' }</td>
            <td>{issue.title}</td>
        </tr>
        );
}

const element = <IssueList/>;
ReactDOM.render(element, document.getElementById('contents'));