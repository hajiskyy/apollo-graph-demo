import { ApolloServer } from '@apollo/server'
import { startStandaloneServer } from '@apollo/server/standalone'
import { readFileSync } from 'fs'

const typeDefs = readFileSync('./src/schema/schema.graphql', 'utf8')

const dogs = [
  {
    id: 1,
    name: 'Buddy',
    dateOfBirth: '10-02-2018',
    breed: 'Golden Retriever',
    isGoodBoy: true,
    owners: [
      {
        name: 'Alice',
        isCurrent: true,
        ownershipStartDate: '02-10-2018',
      },
      {
        name: 'Bob',
        isCurrent: false,
        ownershipStartDate: '08-02-2018',
        ownershipEndDate: '02-10-2019',
      },
    ],
  },
  {
    id: 2,
    name: 'Max',
    dateOfBirth: '01-01-2017',
    breed: 'Dachshund',
    isGoodBoy: true,
  },
  {
    id: 2,
    name: 'Max',
    dateOfBirth: '01-12-2017',
    breed: 'Golden Retriever',
    isGoodBoy: true,
  },
]

const resolvers = {
  Query: {
    dogs: () => dogs,
    dog: (_, { id }) => dogs.find((dog) => dog.id === id),
    owners: () => dogs.flatMap((dog) => dog.owners || []),
    owner: (_, { name }) =>
      dogs
        .flatMap((dog) => dog.owners || [])
        .find((owner) => owner.name === name),
    findDog: (_, { term }) => {
      return dogs.find(
        (dog) => dog.name.includes(term) || dog.breed.includes(term)
      )
    },
  },
  Mutation: {
    updateDogName: (_, { dogId, name }) => {
      const dogIndex = dogs.findIndex((dog) => dog.id === dogId)
      if (dogIndex === -1) {
        throw new Error(`Dog with ID ${dogId} not found.`)
      }
      dogs[dogIndex].name = name
      return dogs[dogIndex]
    },
    addOwner: (_, { dogId, owner }) => {
      const dog = dogs.find((dog) => dog.id === dogId)
      dog.owners = dog.owners || []
      dog.owners.push(owner)
      return dog
    },
    addOwners: (_, { dogId, owners }) => {
      const dog = dogs.find((dog) => dog.id === dogId)
      dog.owners = dog.owners || []
      dog.owners.push(...owners)
      return dog
    },
    updateOwnerStatus: (_, { dogId, ownerName, isCurrent }) => {
      const dog = dogs.find((dog) => dog.id === dogId)
      dog.owners = dog.owners || []
      const owner = dog.owners.find((owner) => owner.name === ownerName)

      if (!owner) {
        throw new Error(`Owner ${ownerName} not found`)
      }

      owner.isCurrent = isCurrent
      if (!isCurrent && !owner.ownershipEndDate) {
        owner.ownershipEndDate = new Date().toISOString()
      }

      return dog
    },
  },
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

const { url } = await startStandaloneServer(server, {
  listen: { port: 4000 },
})

console.log(`🚀  Server ready at: ${url}`)
