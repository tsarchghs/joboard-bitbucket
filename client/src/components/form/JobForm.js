import React from "react";
import SalaryComponent from "./SalaryComponent";
import JobTypeComponent from "./JobTypeComponent";
import PredefinedLocationComponent from "./PredefinedLocationComponent";
import LocationComponent from "./LocationComponent";
import SelectCategoryComponent from "./SelectCategoryComponent";
import ApplyUrlComponent from "./ApplyUrlComponent";
import FeaturedCheckboxComponent from "./FeaturedCheckboxComponent";
import CompanyInfoComponent from "./CompanyInfoComponent";
import PositionComponent from "./PositionComponent";
import RichEditor from "../RichEditor";
import { handleUploadPhotoInput } from "../../helpers";
import "../../richEditor.css"

class JobForm extends React.Component {
    render(){
        console.log(this.props)
        return (
            <React.Fragment>
                <PositionComponent
                    position={this.props.position}
                    onChange={this.props.onChange}
                />

                {
                    window.__PUBLIC_DATA__.use_categories &&
                        <SelectCategoryComponent
                            onChange={this.props.onChange}
                            category={this.props.category}
                        />
                    
                }

                <label className="create-job__input--label"><span className="create-job__input--span">JOB DESCRIPTION</span>
                    <RichEditor onChangeParentApp={this.props.onChangeParentApp} />
                </label>
                <label className="create-job__input--label"><span className="create-job__input--span">Location</span>
                {
                    window.__PUBLIC_DATA__.use_predefined_location &&
                        <PredefinedLocationComponent
                            onChange={this.props.onChange}
                            city={this.props.city}
                        />
                }
                {
                    !window.__PUBLIC_DATA__.use_predefined_location &&
                        <LocationComponent
                            onChange={this.props.onChange}
                            location={this.props.location}
                            remote={this.props.remote}
                            toggle={this.props.toggle}
                        />
                }
                </label>
                    
                <SalaryComponent
                    isRange={this.props.isRange}
                    salaryInputDisabled={this.props.salaryInputDisabled}
                    min_salary={this.props.min_salary}
                    max_salary={this.props.max_salary}
                    salary_currency={this.props.salary_currency}
                    toggle={this.props.toggle}
                    onChange={this.props.onChange}
                    rangeOnChange={this.props.rangeOnChange}
                />
                
                <JobTypeComponent 
                    onChange={this.props.onChange} 
                    job_types={this.props.job_types}
                />

                <ApplyUrlComponent
                    onChange={this.props.onChange}
                    apply_url={this.props.apply_url}
                />
                <FeaturedCheckboxComponent
                    onChange={this.props.onChange}
                    featured={this.props.featured}
                />
                {
                    !this.props.user && !this.props.hideCompany && <span className="line" />	
                }
                {
                    !this.props.user && !this.props.hideCompany &&
                    <CompanyInfoComponent
                        onChange={this.props.onChange}
                        handleUploadPhotoInput={handleUploadPhotoInput}
                        toggle={this.props.toggle}
                        under_company_info_error={this.props.under_company_info_error}
                        hasAccount={this.props.hasAccount}
                        email={this.props.email}
                        password={this.props.password}
                        company_name={this.props.company_name}
                        company_email={this.props.company_email}
                        company_website={this.props.company_website}
                        renderCard={this.props.renderCard}
                        card_error={this.props.card_error}
                        companyLogoInput={this.props.companyLogoInput}
                        assignNodeToLogo={this.props.assignNodeToLogo}
                    />
                }
            </React.Fragment>
        )
    }
}

export default JobForm;