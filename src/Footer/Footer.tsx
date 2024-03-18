const Footer = () => {
    return (
        <footer className="footer-section">
            <div className="container d-flex justify-content-center">
                <div className="footer-content">

                    <div className="policy">
                        <p><a href="/">Privacy Policy</a></p>
                        <p><a href="/">Terms of Use</a></p>
                        <p><a href="/">Cookie Policy</a></p>
                    </div>
                    <div className="about">
                        <p><a href="/">About Us</a></p>
                        <p><a href="/">Our Team</a></p>
                        <p><a href="/">Our Mission</a></p>
                        <div className="footer-social">
                            <i className="fa-brands fa-facebook"></i>
                            <i className="fa-brands fa-twitter"></i>
                            <i className="fa-brands fa-instagram"></i>
                            <i className="fa-brands fa-linkedin"></i>
                        </div>
                    </div>


                </div>
            </div>
            <div className="container d-flex justify-content-center">
                <div className="footer-bottom">
                    <div>© {new Date().getFullYear()} Made possible by Saxe IT Consulting</div>
                </div>
            </div>

        </footer>
    );
}
export default Footer;