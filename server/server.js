const fs                                    = require('fs');
const express                               = require('express');
const { ApolloServer, UserInputError }      = require('apollo-server-express');
const { GraphQLScalarType }                 = require('graphql');
const { Kind }                              = require('graphql/language');
const { MongoClient }                       = require('mongodb');

let aboutMessage = "Issue Tracker API v1.0";
const url = 'mongodb://localhost/issuetracker';
let db;

async function connectToDb () {
    const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true});
    await client.connect();
    console.log('Connected to MongoDB at', url);
    db = client.db();
}

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

async function getNextSequence(name) {
    const result = await db.collection('counters').findOneAndUpdate(
        { _id: name },
        { $inc: { current: 1} },
        { returnOriginal: false }
    );
    return result.value.current;
}

async function issueAdd(_, { issue }) {
    const errors = [];
    issueValidate(issue);
    issue.created = new Date();
    issue.id = await getNextSequence('issues');
    const result = await db.collection('issues').insertOne(issue);
    const savedIssue = await db.collection('issues').findOne({ _id: result.insertedId });
    return savedIssue;
}

async function issueList() {
    const issues = await db.collection('issues').find({}).toArray();
    return issues;
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
(async function () {
    try {
        await connectToDb();
        app.listen(3000, function () {
            console.log('App started on port 3000');
        });
    } catch (err) {
        console.log('ERROR:', err);
    }
})();
