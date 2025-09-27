import { useAppSelector } from '../store/hooks';
import { TabNavigation } from '../components/navigation/TabNavigation';
import { BuilderTab } from '../tabs/BuilderTab';
import { WidgetBuilderTab } from '../tabs/WidgetBuilderTab';
import { WidgetsTab } from '../tabs/WidgetsTab';
import { TemplatesTab } from '../tabs/TemplatesTab';

const Index = () => {
  const { activeTab, zoomLevel } = useAppSelector(state => state.app);

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'builder':
        return <BuilderTab />;
      case 'widgetBuilder':
        return <WidgetBuilderTab />;
      case 'widgets':
        return <WidgetsTab />;
      case 'templates':
        return <TemplatesTab />;
      default:
        return <BuilderTab />;
    }
  };

  return (
    <div 
      className="flex flex-col bg-background text-base"
      style={{
        transform: `scale(${zoomLevel / 100})`,
        transformOrigin: 'top left',
        width: `${100 / (zoomLevel / 100)}%`,
        height: `${100 / (zoomLevel / 100)}%`,
        minHeight: '100vh',
      }}
    >
      <TabNavigation />
      
      <main className="flex-1 overflow-hidden">
        {renderActiveTab()}
      </main>
    </div>
  );
};

export default Index;
