'use client'
import { Hero } from './Hero'
import { About } from './About'
import { RepresentativesSection } from './RepresentativesSection'
import { Schemes } from './Schemes'
import { SchemeEligibilityChecker } from './SchemeEligibilityChecker'
import { VillageStats } from './VillageStats'
import { VillageMap } from './VillageMap'
import { CensusSection } from './CensusSection'
import { VillageResources } from './VillageResources'
import { WardMap } from './WardMap'
import { StaffDirectory } from './StaffDirectory'
import { BudgetSection } from './BudgetSection'
import { EducationSection } from './EducationSection'
import { MidDayMealMenu } from './MidDayMealMenu'
import { SHGDirectory } from './SHGDirectory'
import { HealthSanitationSection } from './HealthSanitationSection'
import { EmergencyContacts } from './EmergencyContacts'
import { WeatherAgriSection } from './WeatherAgriSection'
import { VillageMarketplace } from './VillageMarketplace'
import { GrievanceSection } from './GrievanceSection'
import { EventsCalendarSection } from './EventsCalendarSection'
import { GramSabha } from './GramSabha'
import { PollsSection } from './PollsSection'
import { RTISection } from './RTISection'
import { DownloadsSection } from './DownloadsSection'
import { SuccessStories } from './SuccessStories'
import { FAQSection } from './FAQSection'
import { Infrastructure } from './Infrastructure'
import { PhotoGallery } from './PhotoGallery'
import { VideoGallery } from './VideoGallery'
import { VillageTimeline } from './VillageTimeline'
import { Announcements } from './Announcements'
import { CitizenServiceTracker } from './CitizenServiceTracker'
import { BlogSection } from './BlogSection'
import { PortalFeedback } from './PortalFeedback'
import { AboutPortal } from './AboutPortal'
import { ContactUsSection } from './ContactUsSection'
import { WhatsAppShareButton } from './WhatsAppShareButton'
import { LocationMap } from './LocationMap'
import { ComplaintDashboard } from './ComplaintDashboard'
import { RecentComplaints } from './RecentComplaints'
import { DepartmentDirectory } from './DepartmentDirectory'
import { KineticDivider } from './KineticDivider'
import { PortalActivityFeed } from './PortalActivityFeed'
import { VillageRecords } from './VillageRecords'

export function PublicPortal() {
  return (
    <>
      {/* Print-only header — visible only when printing / saving as PDF */}
      <div className="print-only print-header">
        <h1>ग्राम पंचायत चंद्रा — डिजिटल शासन पोर्टल रिपोर्ट</h1>
        <p>Gram Panchayat Chandra — Digital Governance Portal Report</p>
        <p style={{ fontSize: '9pt', marginTop: '4px' }}>
          पंचायत कोड 3145021064 • विकास खण्ड शंकरगढ़ • जनपद प्रयागराज • उत्तर प्रदेश
        </p>
        <p style={{ fontSize: '9pt' }} suppressHydrationWarning>
          निर्गत तिथि / Generated: {new Date().toLocaleString('en-IN', { dateStyle: 'long', timeStyle: 'short' })}
        </p>
      </div>
      <Hero />
      <ComplaintDashboard />
      <RecentComplaints />
      <PortalActivityFeed />
      <KineticDivider variant="line" />
      <About />
      <RepresentativesSection />
      <KineticDivider variant="dots" />
      <Schemes />
      <SchemeEligibilityChecker />
      <VillageRecords />
      <KineticDivider variant="line" />
      <VillageStats />
      <VillageMap />
      <CensusSection />
      <VillageResources />
      <WardMap />
      <StaffDirectory />
      <DepartmentDirectory />
      <KineticDivider variant="dots" />
      <BudgetSection />
      <EducationSection />
      <MidDayMealMenu />
      <SHGDirectory />
      <HealthSanitationSection />
      <Infrastructure />
      <KineticDivider variant="line" />
      <LocationMap />
      <EmergencyContacts />
      <WeatherAgriSection />
      <VillageMarketplace />
      <KineticDivider variant="dots" />
      <GrievanceSection />
      <CitizenServiceTracker />
      <EventsCalendarSection />
      <GramSabha />
      <PollsSection />
      <KineticDivider variant="line" />
      <RTISection />
      <DownloadsSection />
      <SuccessStories />
      <FAQSection />
      <KineticDivider variant="dots" />
      <PhotoGallery />
      <VideoGallery />
      <VillageTimeline />
      <Announcements />
      <BlogSection />
      <KineticDivider variant="orb" />
      <PortalFeedback />
      <AboutPortal />
      <ContactUsSection />
      <WhatsAppShareButton text="ग्राम पंचायत चंद्रा — डिजिटल शासन पोर्टल | Gram Panchayat Chandra — Digital Governance Portal" section="ग्राम पंचायत चंद्रा" />
    </>
  )
}
