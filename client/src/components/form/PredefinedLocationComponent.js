import React from "react";
import { Query } from "react-apollo";
import { COUNTRIES_QUERY } from "../../Queries";

class PredefinedLocationComponent extends React.Component {
    render(){
        return (
            <Query
                query={COUNTRIES_QUERY}
            >
                {({ loading, error, data }) => {
                    if (error) return error.message;
                    if (loading) return "Loading";
                    console.log(data)
                    let countries = data.countries;
                    let cities = countries.map(country => country.cities).flat();
                    if (!window.__PUBLIC_DATA__) window.__PUBLIC_DATA__ = {} 
                    return (
                        <div className="create-job__checkbox">
                            {
                                cities.map(city => (
                                    <label className="radio-container">
                                        <input 
                                            value={city.id} 
                                            onChange={e => this.props.onChange(e, "city")} 
                                            checked={this.props.city === undefined ? this.props.city == window.__PUBLIC_DATA__.default_city : this.props.city == city.id} 
                                            type="checkbox" 
                                            name="radio" 
                                        />
                                        <span className="checkmarked">
                                            <p>{city.name}</p>
                                        </span>
                                    </label>
                                ))
                            }

                        </div>
                    )
                }}
            </Query>
        )
    }
}

export default PredefinedLocationComponent;