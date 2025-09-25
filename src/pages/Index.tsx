import { useAppSelector } from '../store/hooks';
import { TabNavigation } from '../components/navigation/TabNavigation';
import { BuilderTab } from '../tabs/BuilderTab';
import { WidgetsTab } from '../tabs/WidgetsTab';
import { TemplatesTab } from '../tabs/TemplatesTab';
import { LogicTab } from '../tabs/LogicTab';

const Index = () => {
  const { activeTab } = useAppSelector(state => state.app);

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'builder':
        return <BuilderTab />;
      case 'widgets':
        return <WidgetsTab />;
      case 'templates':
        return <TemplatesTab />;
      case 'logic':
        return <LogicTab />;
      default:
        return <BuilderTab />;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <TabNavigation />
      
      <main className="flex-1 overflow-hidden">
        {renderActiveTab()}
      </main>
    </div>
  );
};

export default Index;
