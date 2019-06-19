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
            receipt_url
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

const JOB_QUERY = gql`
    query Job(
        $id: ID!
    ){
        job(id: $id) {
            id
            position
            company {
                id
                logo {
                    id
                    url
                }
                name
                website
                email
            }
            expiresAt
            description
            apply_url
            location
            company_logo {
                id
                url
            }
            company_name
            company_website
            company_email
            createdAt
            job_type
            status
            salary
        }
    }
`

const UPDATE_JOB_QUERY = gql`
    mutation UpdateJob(
		$id: ID!
		$position: String
		$description: String
		$location: String
		$salary: Int
		$job_type: JOB_TYPE
		$apply_url: String
    ){
        updateJob(
            id: $id
            position: $position
            description: $description
            location: $location
            salary: $salary
            job_type: $job_type
            apply_url: $apply_url
        ){
            id
            position
            company {
                id
                logo {
                    id
                    url
                }
                name
                website
                email
            }
            expiresAt
            description
            apply_url
            location
            company_logo {
                id
                url
            }
            company_name
            company_website
            company_email
            createdAt
            job_type
            status
            salary
        }
    }
`
const DELETE_JOB_MUTATITON = gql`
    mutation DeleteJob(
        $id: ID!
    ){
        deleteJob(
            id: $id
        ) {
            id
        }
    }
`

const CREATE_JOB_MUTATION = gql`
    mutation CreateJob(
        $position: String!
        $location: String!
        $salary: Int!
        $job_type: JOB_TYPE!
        $status: STATUS_TYPE!
        $apply_url: String!
        $description: String
        $company: ID
        $company_logo: String
        $company_name: String
        $company_email: String
        $company_website: String
        $stripe_token: String
        $bp: Boolean!
    ) {
        createJob(
            position: $position
            location: $location
            salary: $salary
            job_type: $job_type
            status: $status
            apply_url: $apply_url
            description: $description
            company: $company
            company_logo: $company_logo
            company_name: $company_name
            company_email: $company_email
            company_website: $company_website
            stripe_token: $stripe_token
            bp: $bp
        ){
            id
            location
            position
            status
            job_type
            expiresAt
        }
    }
`

export {
    INVOICES_QUERY,
    GET_LOGGED_IN_USER,
    JOB_QUERY,
    UPDATE_JOB_QUERY,
    DELETE_JOB_MUTATITON,
    CREATE_JOB_MUTATION
}