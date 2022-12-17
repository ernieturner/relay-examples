/**
 * Basic GraphQL schema for the Newsfeed app.
 */

import { storyUserResolver, newsfeedResolver, topStoryResolver } from './resolvers.mjs';

import {
  GraphQLBoolean,
  GraphQLEnumType,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLScalarType,
  GraphQLSchema,
  GraphQLString,
  GraphQLInterfaceType
} from 'graphql';

// const DateTimeType = new GraphQLScalarType({
//   name: 'DateTime',
//   serialize: (value) => value,
// });
// FIXME temporary until can figure out customScalarTypes config
const DateTimeType = GraphQLString;

const NodeInterface = new GraphQLInterfaceType({
  name: 'Node',
  fields: {
    id: {type: new GraphQLNonNull(GraphQLID)},
  }
});

const CategoryType = new GraphQLEnumType({
  name: 'Category',
  values: {
    ALL: { value: "ALL" },
    EDUCATION: { value: "EDUCATION" },
    NEWS: { value: "NEWS" },
    COOKING: { value: "COOKING" },
  }
});


const Image = new GraphQLObjectType({
  name: 'Image',
  fields: {
    url: {type: new GraphQLNonNull(GraphQLString)},
  },
});


const ActorInterface = new GraphQLInterfaceType({
  name: 'Actor',
  fields: {
    name: {type: GraphQLString},
    profilePicture: {type: Image},
  }
});

const UserType = new GraphQLObjectType({
  name: 'User',
  fields: {
    id: {type: new GraphQLNonNull(GraphQLID)},
    name: {type: GraphQLString},
    email: {type: GraphQLString},
    profilePicture: {type: Image},
  },
  interfaces: [NodeInterface, ActorInterface],
});

const StoryType = new GraphQLObjectType({
  name: 'Story',
  fields: {
    createdAt: {type: new GraphQLNonNull(DateTimeType)},
    id: {type: new GraphQLNonNull(GraphQLID)},
    category: {type: CategoryType},
    title: {type: new GraphQLNonNull(GraphQLString)},
    summary: {type: GraphQLString},
    updatedAt: {type: DateTimeType},
    attachments: {type: new GraphQLList(Image)},
    poster: {type: new GraphQLNonNull(ActorInterface), resolve: storyUserResolver},
    thumbnail: {type: Image},
  },
  interfaces: [NodeInterface],
});


const ConnectionEdgeType = new GraphQLObjectType({
  name: 'ConnectionEdge',
  fields: {
    node: {
      type: NodeInterface,
    },
    cursor: {
      type: GraphQLString,
    },
  },
});

const PageInfoType = new GraphQLObjectType({
  name: 'PageInfo',
  fields: {
    startCursor: {type: GraphQLString},
    endCursor: {type: GraphQLString},
    hasNextPage: {type: GraphQLBoolean},
    hasPreviousPage: {type: GraphQLBoolean},
  },
});

const ConnectionType = new GraphQLObjectType({
  name: 'Connection',
  fields: {
    edges: {
      type: new GraphQLList(ConnectionEdgeType),
    },
    pageInfo: {
      type: PageInfoType,
    },
  },
});

const ViewerType = new GraphQLObjectType({
  name: 'Viewer',
  fields: {
    actor: {
      type: ActorInterface,
    },
    newsfeed: {
      args: {
        first: {
          type: GraphQLInt,
        },
        after: {
          type: GraphQLString,
        },
      },
      type: ConnectionType,
      resolve: newsfeedResolver,
    },
  },
});

const QueryType = new GraphQLObjectType({
  name: 'Query',
  fields: {
    viewer: {type: ViewerType},
    node: {
      type: NodeInterface,
      args: {
        id: {type: new GraphQLNonNull(GraphQLID)},
      },
    },
    topStory: {
      type: StoryType,
      resolve: topStoryResolver,
      args: {
        category: {type: CategoryType}
      }
    },
  },
});

export const schema = new GraphQLSchema({
  query: QueryType,
  types: [UserType, StoryType],
});