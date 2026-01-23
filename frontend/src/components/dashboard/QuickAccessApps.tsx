'use client';

import React, { useState } from 'react';
import { 
  Plus, Check, Image, Calendar, Mail, MapPin, 
  X, Edit2, Trash2, Phone, Building 
} from 'lucide-react';

interface QuickAccessAppsProps {
  appName: string;
}

export const QuickAccessApps: React.FC<QuickAccessAppsProps> = ({ appName }) => {
  // DUMMY DATA - Feature under development
  const [notes, setNotes] = useState([
    { id: 1, title: 'Meeting Notes', content: 'Discuss Q1 goals and team objectives for the upcoming quarter...', date: '2026-01-20', color: 'yellow' },
    { id: 2, title: 'Shopping List', content: 'Milk, Eggs, Bread, Butter, Coffee, Fruits...', date: '2026-01-19', color: 'blue' },
    { id: 3, title: 'Project Ideas', content: 'New features for the dashboard, mobile app improvements...', date: '2026-01-18', color: 'green' }
  ]);

  const [events, setEvents] = useState([
    { id: 1, title: 'Team Meeting', date: '2026-01-22', time: '10:00 AM', location: 'Conference Room A' },
    { id: 2, title: 'Project Deadline', date: '2026-01-25', time: '5:00 PM', location: 'Online' },
    { id: 3, title: 'Client Presentation', date: '2026-01-23', time: '2:00 PM', location: 'Client Office' }
  ]);

  const [contacts, setContacts] = useState([
    { id: 1, name: 'Virat Kohli', email: 'Virat@example.com', phone: '+91 (234) 567-8900', company: 'BCCI' },
    { id: 2, name: 'Rohit Sharma', email: 'Rohit@example.com', phone: '+91 (098) 765-4321', company: 'BCCI' },
    { id: 3, name: ' Johnson', email: 'mike@example.com', phone: '+1 (112) 233-4455', company: 'Marketing Inc' }
  ]);

  const [locations, setLocations] = useState([
    { id: 1, device: 'iPhone 17 Pro', location: 'Home', lastSeen: '2 mins ago', battery: 85, status: 'online' },
    { id: 2, device: 'MacBook Pro', location: 'Office', lastSeen: '1 hour ago', battery: 62, status: 'online' },
    { id: 3, device: 'Samsung s24', location: 'Coffee Shop', lastSeen: '3 hours ago', battery: 45, status: 'offline' }
  ]);

  const [photos, setPhotos] = useState([
    { id: 1, name: 'Vacation 2026', date: '2026-01-15', count: 24 },
    { id: 2, name: 'Work Events', date: '2026-01-10', count: 12 },
    { id: 3, name: 'Family Gathering', date: '2026-01-05', count: 36 },
    { id: 4, name: 'Weekend Trip', date: '2026-01-01', count: 18 }
  ]);

  const [emails, setEmails] = useState([
    { id: 1, from: 'Rohit', subject: 'Meeting Tomorrow', preview: 'Hi, just confirming our meeting for tomorrow at 10 AM...', time: '10:30 AM', read: false },
    { id: 2, from: 'Virat', subject: 'Project Update', preview: 'The project is progressing well. Here are the latest updates...', time: 'Yesterday', read: true },
    { id: 3, from: 'Team Lead', subject: 'Weekly Review', preview: 'Please submit your weekly reports by Friday EOD...', time: '2 days ago', read: false },
    { id: 4, from: 'HR Department', subject: 'Holiday Schedule', preview: 'The updated holiday schedule for 2026 is now available...', time: '3 days ago', read: true }
  ]);

  const [reminders, setReminders] = useState([
    { id: 1, task: 'Buy groceries', time: 'Today, 5:00 PM', done: false, priority: 'high' },
    { id: 2, task: 'Call doctor', time: 'Tomorrow, 9:00 AM', done: false, priority: 'medium' },
    { id: 3, task: 'Submit report', time: 'Jan 25, 2:00 PM', done: true, priority: 'high' },
    { id: 4, task: 'Review documents', time: 'Jan 26, 11:00 AM', done: false, priority: 'low' }
  ]);

  const toggleReminder = (id: number) => {
    setReminders(reminders.map(r => 
      r.id === id ? { ...r, done: !r.done } : r
    ));
  };

  const markEmailAsRead = (id: number) => {
    setEmails(emails.map(e => 
      e.id === id ? { ...e, read: true } : e
    ));
  };

  const renderAppContent = () => {
    switch (appName) {
      case 'Photos':
        return (
          <div className="space-y-6">
            {/* Development Notice */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-lg">🌈</span>
                </div>
                <div>
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">Feature Under Development</h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    This is dummy data for demonstration purposes. We're working on integrating real photo galleries. Stay tuned!
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Albums</h3>
              <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-400 to-pink-500 text-white rounded-lg hover:opacity-90 transition-opacity text-sm">
                <Plus className="w-4 h-4" />
                Upload Photos
              </button>
            </div>
            {photos.map(album => (
              <div key={album.id} className="space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold text-lg text-gray-900 dark:text-white">{album.name}</h4>
                  <span className="text-sm text-gray-500 dark:text-gray-400">{album.count} photos • {album.date}</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {Array.from({ length: Math.min(album.count, 6) }).map((_, i) => (
                    <div key={i} className="aspect-square bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-lg flex items-center justify-center hover:scale-105 transition-transform cursor-pointer">
                      <Image className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        );
      
      case 'Mail':
        return (
          <div className="space-y-4">
            {/* Development Notice */}
            <div className="bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-lg">⚠️</span>
                </div>
                <div>
                  <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-1">Demo Data Only</h4>
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    Currently showing sample emails. Real email integration coming soon. Be in touch!
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Inbox</h3>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm">
                <Plus className="w-4 h-4" />
                Compose
              </button>
            </div>
            <div className="space-y-2">
              {emails.map((mail) => (
                <div 
                  key={mail.id} 
                  onClick={() => markEmailAsRead(mail.id)}
                  className={`${mail.read ? 'bg-white dark:bg-gray-800' : 'bg-blue-50 dark:bg-blue-900/20'} border-2 border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-blue-500 dark:hover:border-blue-400 transition-colors cursor-pointer`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                        {mail.from.charAt(0)}
                      </div>
                      <div>
                        <h4 className={`${mail.read ? 'font-medium' : 'font-bold'} text-gray-900 dark:text-white`}>{mail.from}</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{mail.time}</p>
                      </div>
                    </div>
                    {!mail.read && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                  </div>
                  <h5 className={`${mail.read ? 'font-medium' : 'font-bold'} mb-1 text-gray-900 dark:text-white`}>{mail.subject}</h5>
                  <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-1">{mail.preview}</p>
                </div>
              ))}
            </div>
          </div>
        );

      case 'Notes':
        return (
          <div className="space-y-4">
            {/* Development Notice */}
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-lg">📝</span>
                </div>
                <div>
                  <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-1">Work in Progress</h4>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    These are placeholder notes. Full notes functionality is under development. Stay connected!
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">All Notes</h3>
              <button className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors text-sm">
                <Plus className="w-4 h-4" />
                New Note
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {notes.map(note => (
                <div 
                  key={note.id} 
                  className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-800 rounded-lg p-4 hover:shadow-lg transition-all cursor-pointer group"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-lg text-gray-900 dark:text-white">{note.title}</h4>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      <button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
                        <Edit2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      </button>
                      <button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
                        <Trash2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      </button>
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-3">{note.content}</p>
                  <span className="text-xs text-gray-500 dark:text-gray-500">{note.date}</span>
                </div>
              ))}
            </div>
          </div>
        );
      
      case 'Calendar':
        return (
          <div className="space-y-4">
            {/* Development Notice */}
            <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-lg">📅</span>
                </div>
                <div>
                  <h4 className="font-semibold text-red-900 dark:text-red-100 mb-1">Coming Soon</h4>
                  <p className="text-sm text-red-700 dark:text-red-300">
                    Sample events displayed. Real calendar integration is in development. Keep checking back!
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Upcoming Events</h3>
              <button className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm">
                <Plus className="w-4 h-4" />
                New Event
              </button>
            </div>
            <div className="space-y-3">
              {events.map(event => (
                <div key={event.id} className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-red-500 dark:hover:border-red-400 transition-colors cursor-pointer">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-3">
                      <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-6 h-6 text-red-500" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-lg text-gray-900 dark:text-white">{event.title}</h4>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">{event.date} at {event.time}</p>
                        <p className="text-gray-500 dark:text-gray-500 text-xs mt-1">📍 {event.location}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'Reminders':
        return (
          <div className="space-y-4">
            {/* Development Notice */}
            <div className="bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-200 dark:border-orange-800 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-lg">⏰</span>
                </div>
                <div>
                  <h4 className="font-semibold text-orange-900 dark:text-orange-100 mb-1">Demo Version</h4>
                  <p className="text-sm text-orange-700 dark:text-orange-300">
                    Test reminders only. Full reminder system with notifications is being built. Stay tuned!
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">All Reminders</h3>
              <button className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm">
                <Plus className="w-4 h-4" />
                New Reminder
              </button>
            </div>
            <div className="space-y-2">
              {reminders.map((reminder) => (
                <div key={reminder.id} className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-orange-500 dark:hover:border-orange-400 transition-colors">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleReminder(reminder.id)}
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all ${
                        reminder.done 
                          ? 'bg-orange-500 border-orange-500' 
                          : 'border-gray-300 dark:border-gray-600 hover:border-orange-500'
                      }`}
                    >
                      {reminder.done && <Check className="w-4 h-4 text-white" />}
                    </button>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className={`font-semibold ${reminder.done ? 'line-through text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                          {reminder.task}
                        </h4>
                        {reminder.priority === 'high' && !reminder.done && (
                          <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs rounded-full font-medium">
                            High
                          </span>
                        )}
                      </div>
                      <p className="text-gray-500 dark:text-gray-400 text-sm">{reminder.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      
      case 'Contacts':
        return (
          <div className="space-y-4">
            {/* Development Notice */}
            <div className="bg-gray-50 dark:bg-gray-900/40 border-2 border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-lg">👥</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Preview Mode</h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Displaying sample contacts. Real contact management features are under development. Be in touch!
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">All Contacts</h3>
              <button className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm">
                <Plus className="w-4 h-4" />
                New Contact
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {contacts.map(contact => (
                <div key={contact.id} className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-gray-700 dark:hover:border-gray-500 transition-colors cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-gray-600 to-gray-800 rounded-full flex items-center justify-center text-white font-semibold text-xl flex-shrink-0">
                      {contact.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-lg text-gray-900 dark:text-white truncate">{contact.name}</h4>
                      <p className="text-gray-600 dark:text-gray-400 text-sm truncate">
                        <Building className="w-3 h-3 inline mr-1" />
                        {contact.company}
                      </p>
                      <p className="text-gray-500 dark:text-gray-500 text-sm mt-1 truncate">
                        📧 {contact.email}
                      </p>
                      <p className="text-gray-500 dark:text-gray-500 text-sm truncate">
                        <Phone className="w-3 h-3 inline mr-1" />
                        {contact.phone}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      
      case 'Find My':
        return (
          <div className="space-y-4">
            {/* Development Notice */}
            <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-white text-lg">📍</span>
                </div>
                <div>
                  <h4 className="font-semibold text-green-900 dark:text-green-100 mb-1">Prototype Data</h4>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Mock device locations shown. Real device tracking integration coming soon. Stay connected!
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">My Devices</h3>
            </div>
            <div className="space-y-3">
              {locations.map(location => (
                <div key={location.id} className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-green-500 dark:hover:border-green-400 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 ${location.status === 'online' ? 'bg-green-500' : 'bg-gray-400'} rounded-full flex items-center justify-center flex-shrink-0`}>
                        <MapPin className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-lg text-gray-900 dark:text-white">{location.device}</h4>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">📍 {location.location}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <p className="text-gray-500 dark:text-gray-500 text-xs">Last seen: {location.lastSeen}</p>
                          <p className="text-gray-500 dark:text-gray-500 text-xs">🔋 {location.battery}%</p>
                        </div>
                      </div>
                    </div>
                    <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm transition-colors">
                      Locate
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'Files':
        return (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">📁</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Files App</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              You're already using the Files feature in the main dashboard!
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Navigate to "My Drive" from the sidebar to manage your files.
            </p>
          </div>
        );
      
    
    }
  };

  return (
    <div className="animate-fadeIn">
      {renderAppContent()}
    </div>
  );
};

export default QuickAccessApps;