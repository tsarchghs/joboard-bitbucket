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
        role
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
                remote
                position
                status
                job_types
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
            city {
                id
                name
                country {
                    id
                    name
                }
            }
            expiresAt
            description
            apply_url
            location
            remote
            company_logo {
                id
                url
            }
            company_name
            company_website
            company_email
            createdAt
            job_types
            status
            min_salary
            max_salary
            salary_currency
            category
        }
    }
`

const UPDATE_JOB_MUTATION = gql`
    mutation UpdateJob(
		$id: ID!
        $city: ID
        $category: JOB_CATEGORY
		$position: String
		$description: String
		$location: String
        $remote: Boolean
		$min_salary: Int
		$max_salary: Int
		$salary_currency: CURRENCY
		$job_types: [JOB_TYPE!]!
		$apply_url: String
    ){
        updateJob(
            id: $id
            city: $city
            category: $category
            position: $position
            description: $description
            location: $location
            remote: $remote
            min_salary: $min_salary
            max_salary: $max_salary
            salary_currency: $salary_currency
            job_types: $job_types
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
            remote
            company_logo {
                id
                url
            }
            city {
                id
                name
                country {
                    id
                    name
                }
            }
            company_name
            company_website
            company_email
            createdAt
            job_types
            status
            min_salary
            max_salary
            salary_currency
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
        $category: JOB_CATEGORY
        $position: String!
        $location: String
        $remote: Boolean!
        $city: ID
		$min_salary: Int
		$max_salary: Int
		$salary_currency: CURRENCY
        $job_types: [JOB_TYPE!]!
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
            category: $category
            position: $position
            location: $location
            remote: $remote
            city: $city
            min_salary: $min_salary
            max_salary: $max_salary
            salary_currency: $salary_currency
            job_types: $job_types
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
            remote
            position
            status
            job_types
            expiresAt
        }
    }
`

const CREATE_JOB_AND_LOGIN_MUTATION = gql`
    mutation CreateJobAndLogin(
        $category: JOB_CATEGORY
		$email: String!
		$password: String!
		$position: String!
		$location: String!
        $remote: Boolean!
		$min_salary: Int
		$max_salary: Int
		$salary_currency: CURRENCY
        $job_types: [JOB_TYPE!]!
		$status: STATUS_TYPE!
		$apply_url: String!
		$description: String!
		$stripe_token: String!
    ){
        createJobAndLogin(
            category: $category
            email: $email
            password: $password
            position: $position
            location: $location
            remote: $remote
            min_salary: $min_salary
            max_salary: $max_salary
            salary_currency: $salary_currency
            job_types: $job_types
            status: $status
            apply_url: $apply_url
            description: $description
            stripe_token: $stripe_token
        ){
            auth_data {
                token
            }
            job {
                id
            }
        }
    }
`

const COUNTRIES_QUERY = gql`
    query {
        countries {
            id
            name
            cities {
                id
                name
            }
        }
    }
`

export {
    INVOICES_QUERY,
    GET_LOGGED_IN_USER,
    JOB_QUERY,
    UPDATE_JOB_MUTATION,
    DELETE_JOB_MUTATITON,
    CREATE_JOB_MUTATION,
    CREATE_JOB_AND_LOGIN_MUTATION,
    COUNTRIES_QUERY
}