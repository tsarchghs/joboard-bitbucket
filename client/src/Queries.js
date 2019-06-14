import gql from "graphql-tag";

const INVOICES_QUERY = gql`
    query {
        invoices {
            id
            job {
                id
                position
            }
            price
            status
            last_four_digits
            createdAt
        }
    }
`

const GET_LOGGED_IN_USER = gql`
    query {
        getLoggedInUser{
        id
        company {
            id
            name
            website
            email
            logo {
            id
            url
            }
            jobs {
                id
                location
                position
                status
                job_type
                expiresAt
            }
        }
        }
    }
`

export {
    INVOICES_QUERY,
    GET_LOGGED_IN_USER
}