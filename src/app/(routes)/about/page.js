// import Header from '@/components/Header'
// import Footer from '@/components/Footer'
import './about.css'

export default function AboutPage(){
	return(
		<>
			<div>
                {/* <Header /> */}
                {/* <Nav /> */}
            </div>
				<container className='about-page'>
					<p className='about-p-1'>This is a mighty fine Next.js payments and expenses site. Where you can let us all here know where you are and what you're doing!</p>
					<img className='about-image-1' src="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fd1ut31suh1xx3k.cloudfront.net%2Fwp-content%2Fuploads%2F2018%2F11%2F15135728%2Fshutterstock_1228756897.jpg&f=1&nofb=1&ipt=a35aeef94bac0023512b00d98743facec051e63836b466f41cf12fc5360b6674" alt="An image of a beach." />
                    <img className='about-image-2' src="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fd1ut31suh1xx3k.cloudfront.net%2Fwp-content%2Fuploads%2F2018%2F11%2F15135728%2Fshutterstock_1228756897.jpg&f=1&nofb=1&ipt=a35aeef94bac0023512b00d98743facec051e63836b466f41cf12fc5360b6674" alt="An image of a beach." />
                    <p className='about-p-2'>This is where you will find some more information about us</p>
				</container>
			{/* <Footer /> */}
		</>
	);
}