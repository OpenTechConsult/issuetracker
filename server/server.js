const fs                                    = require('fs');
const express                               = require('express');
const { ApolloServer, UserInputError }      = require('apollo-server-express');
const { GraphQLScalarType }                 = require('graphql');
const { Kind }                              = require('graphql/language')

let aboutMessage = "Issue Tracker API v1.0";

const IssuesDB = [
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

const GraphQLDate = new GraphQLScalarType({
    name: 'GraphQLDate',
    description: 'A Date() type in GraphQL as a scalar',
    serialize(value) {
        return value.toISOString();
    },

    // catch invalid date string when parsing the value
    parseValue(value) {
        const dateValue = new Date(value);
        return isNaN(dateValue) ? undefined : dateValue;
    },
    parseLiteral(ast) {
        if (ast.kind == Kind.STRING) {
            const value = new Date(ast.value)
            return isNaN(value) ? undefined : value;
        }
    },
});

const resolvers = {
    Query: {
        about: ()=> aboutMessage,
        issueList,
    },
    Mutation: {
        setAboutMessage,
        issueAdd,
    },
    GraphQLDate,
};


function setAboutMessage(_, { message }) {
    return aboutMessage = message
}

// programmatic validation on the server side
// must be called before saving a new issue 
// is done in a separate function
function issueValidate(issue) {
    
    // create an array to hold the error messages
    // of failed validation
    const errors = []

    // check to see if the minimum length oh the issue's
    // title is greater than 3. If not push a message
    // in the errors array
    if (issue.title.length < 3) {
        errors.push('Field "Title" must be at least 3 characters long.')
    }

    // check whether the owner has a value when
    // the status is set to Assigned
    if (issue.status == 'Assigned' && !issue.owner) {
        errors.push('Field "Owner" is required when status is "Assigned"');
    }

    // If we find that the errors array is not empty, we throw an error
    // Apollo server recommends using UserInputError class that generate user errors
    if (errors.length > 0) {
        throw new UserInputError('Invalid input(s)', { errors });
    }
}

function issueAdd(_, { issue }) {
    issueValidate(issue);
    issue.created = new Date();
    issue.id = IssuesDB.length + 1;
    IssuesDB.push(issue);
    return issue;
}

function issueList() {
    return IssuesDB;
}

// Add the formatError configuration option to capture the error at the server
const server = new ApolloServer({
    typeDefs: fs.readFileSync('./server/schema.graphql', 'utf-8'), 
    resolvers,
    formatError: error => {
        console.log(error);
        return error;
    },
}); 

const app     = express();
app.use(express.static('public'));
server.applyMiddleware({ app, path: '/graphql' });
app.listen(3000, function () {
    console.log('App started on port 3000');
});