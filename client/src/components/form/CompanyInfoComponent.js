import React from "react";

class CompanyInfoComponent extends React.Component {
    render(){
        return (
            <div className="company-info">
                {
                    !this.props.user &&
                    (
                        <div className="company-info__avatar">
                            <h5>Company info</h5>

                            <a onClick={e => {
                                e.preventDefault()
                                this.props.toggle("hasAccount")
                            }}>{this.props.hasAccount ? "Create new company?" : "Do you have an account?"}</a>
                        </div>
                    )
                }
                <h1>{this.props.under_company_info_error}</h1>
                {
                    this.props.user ? null
                        :
                        <div>
                            {
                                this.props.hasAccount &&
                                (
                                    <div>
                                        <label style={{ marginTop: 35 }} className="create-job__input--label"><span className="create-job__input--span">Email</span>
                                            <input
                                                className="input"
                                                type="email"
                                                placeholder="Your email here"
                                                onChange={e => this.props.onChange(e, "email")}
                                                value={this.props.email}
                                                required
                                            />
                                        </label>
                                        <label className="create-job__input--label"><span className="create-job__input--span">Password</span>
                                            <input
                                                className="input"
                                                type="password"
                                                placeholder="Your password here"
                                                value={this.props.password}
                                                onChange={e => this.props.onChange(e, "password")}
                                                required
                                            />
                                        </label>
                                    </div>
                                )
                            }
                            {
                                !this.props.hasAccount &&
                                (
                                    <div>
                                        <div className="upload-image">
                                            <div ref={node => this.companyLogoDiv = node} style={{ display: "inline" }} className="upload-image__img" style={{
                                                backgroundImage: 'url("")',
                                                backgroundSize: "cover",
                                                backgroundRepeat: "no-repeat"
                                            }} />
                                            <div style={{ display: "inline" }} style={{
                                                position: "relative",
                                                overflow: "hidden",
                                                display: "inline-block"
                                            }}>
                                                <button style={{
                                                    border: "1px solid #007CFF",
                                                    color: "#007CFF",
                                                    backgroundColor: "white",
                                                    padding: "8px 10px",
                                                    borderRadius: "8px",
                                                    fontSize: "14px",
                                                    fontWeight: "bold",
                                                    marginTop: 10,
                                                    marginLeft: 11
                                                }}>Upload a file</button>
                                                <input style={{
                                                    fontSize: "100px",
                                                    position: "absolute",
                                                    left: 0,
                                                    top: 0,
                                                    opacity: 0
                                                }}
                                                    ref={node => this.props.assignNodeToLogo(node)}
                                                    onChange={e => {
                                                        e.persist();
                                                        this.props.handleUploadPhotoInput(e.target, this.companyLogoDiv);
                                                    }}
                                                    type="file" name="myfile" />
                                            </div>
                                        </div>
                                        <label className="create-job__input--label"><span className="create-job__input--span">Company name</span>
                                            <input
                                                className="input"
                                                type="text"
                                                placeholder="Type your company name"
                                                onChange={e => this.props.onChange(e, "company_name")}
                                                value={this.props.company_name}
                                                required
                                            />
                                        </label>
                                        <label className="create-job__input--label"><span className="create-job__input--span">Company email</span>
                                            <input
                                                className="input"
                                                type="email"
                                                placeholder="Your Email here"
                                                value={this.props.company_email}
                                                onChange={e => this.props.onChange(e, "company_email")}
                                                required
                                            />
                                        </label>
                                        <label className="create-job__input--label"><span className="create-job__input--span">Company website</span>
                                            <input
                                                className="input"
                                                type="text"
                                                placeholder="Company website"
                                                value={this.props.company_website}
                                                onChange={e => this.props.onChange(e, "company_website")}
                                                required
                                            />
                                        </label>
                                    </div>
                                )
                            }
                        </div>
                }
            </div>
        )
    }
}

export default CompanyInfoComponent;