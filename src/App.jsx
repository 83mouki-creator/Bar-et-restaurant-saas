import React, { useState, useEffect } from 'react';

import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

import { Menu, LogOut, Plus, Trash2, Download, Eye, EyeOff } from 'lucide-react';


const RestaurantSaaS = () => {

  const [currentUser, setCurrentUser] = useState(null);

  const [restaurants, setRestaurants] = useState(() => {

    const saved = localStorage.getItem('restaurants');

    return saved ? JSON.parse(saved) : {};

  });

  const [showLogin, setShowLogin] = useState(true);

  const [loginEmail, setLoginEmail] = useState('');

  const [loginPassword, setLoginPassword] = useState('');

  const [selectedRestaurant, setSelectedRestaurant] = useState(null);

  const [activeTab, setActiveTab] = useState('dashboard');

  const [showNewRestaurant, setShowNewRestaurant] = useState(false);

  const [newRestaurantName, setNewRestaurantName] = useState('');


  // État pour caisse

  const [caisse, setCaisse] = useState({ ventes: [], decaissements: [] });

  const [showCaisseForm, setShowCaisseForm] = useState(false);

  const [venteForm, setVenteForm] = useState({ description: '', montant: '', categorie: 'plats' });

  const [decaissementForm, setDecaissementForm] = useState({ description: '', montant: '' });


  // État pour stock

  const [stock, setStock] = useState([]);

  const [showStockForm, setShowStockForm] = useState(false);

  const [stockForm, setStockForm] = useState({ nom: '', quantite: '', prixUnitaire: '', categorie: 'ingredients' });


  // Charger données du restaurant sélectionné

  useEffect(() => {

    if (selectedRestaurant && restaurants[selectedRestaurant.id]) {

      const data = restaurants[selectedRestaurant.id];

      setCaisse(data.caisse || { ventes: [], decaissements: [] });

      setStock(data.stock || []);

    }

  }, [selectedRestaurant, restaurants]);


  // Sauvegarder données

  const saveData = (restaurantId, newCaisse = null, newStock = null) => {

    setRestaurants(prev => {

      const updated = { ...prev };

      updated[restaurantId] = {

        ...updated[restaurantId],

        caisse: newCaisse !== null ? newCaisse : caisse,

        stock: newStock !== null ? newStock : stock,

        lastUpdated: new Date().toISOString()

      };

      localStorage.setItem('restaurants', JSON.stringify(updated));

      return updated;

    });

  };


  // ===== LOGIN / REGISTRATION =====

  const handleLogin = (e) => {

    e.preventDefault();

    if (!loginEmail || !loginPassword) return;


    // Simulation login

    const user = {

      id: loginEmail.toLowerCase(),

      email: loginEmail,

      role: loginEmail.includes('owner') ? 'proprietaire' : 'gerant',

      name: loginEmail.split('@')[0]

    };


    setCurrentUser(user);

    setShowLogin(false);

    setLoginEmail('');

    setLoginPassword('');


    // Créer restaurant de test si premier login propriétaire

    if (user.role === 'proprietaire' && Object.keys(restaurants).length === 0) {

      const testRestaurant = {

        id: 'rest-' + Date.now(),

        name: 'Mon Restaurant de Test',

        owner: user.id,

        caisse: { ventes: [], decaissements: [] },

        stock: [],

        createdAt: new Date().toISOString()

      };

      setRestaurants(prev => {

        const updated = { ...prev, [testRestaurant.id]: testRestaurant };

        localStorage.setItem('restaurants', JSON.stringify(updated));

        return updated;

      });

      setSelectedRestaurant(testRestaurant);

    }

  };


  // ===== CAISSE =====

  const addVente = (e) => {

    e.preventDefault();

    if (!venteForm.description || !venteForm.montant) return;


    const newVente = {

      id: Date.now(),

      date: new Date().toISOString(),

      description: venteForm.description,

      montant: parseFloat(venteForm.montant),

      categorie: venteForm.categorie

    };


    const newCaisse = {

      ...caisse,

      ventes: [...caisse.ventes, newVente]

    };

    setCaisse(newCaisse);

    saveData(selectedRestaurant.id, newCaisse);

    setVenteForm({ description: '', montant: '', categorie: 'plats' });

  };


  const addDecaissement = (e) => {

    e.preventDefault();

    if (!decaissementForm.description || !decaissementForm.montant) return;


    const newDecaissement = {

      id: Date.now(),

      date: new Date().toISOString(),

      description: decaissementForm.description,

      montant: parseFloat(decaissementForm.montant)

    };


    const newCaisse = {

      ...caisse,

      decaissements: [...caisse.decaissements, newDecaissement]

    };

    setCaisse(newCaisse);

    saveData(selectedRestaurant.id, newCaisse);

    setDecaissementForm({ description: '', montant: '' });

  };


  // ===== STOCK =====

  const addStock = (e) => {

    e.preventDefault();

    if (!stockForm.nom || !stockForm.quantite) return;


    const newItem = {

      id: Date.now(),

      nom: stockForm.nom,

      quantite: parseFloat(stockForm.quantite),

      prixUnitaire: parseFloat(stockForm.prixUnitaire) || 0,

      categorie: stockForm.categorie,

      dateAjout: new Date().toISOString()

    };


    const newStock = [...stock, newItem];

    setStock(newStock);

    saveData(selectedRestaurant.id, null, newStock);

    setStockForm({ nom: '', quantite: '', prixUnitaire: '', categorie: 'ingredients' });

  };


  const deleteStock = (id) => {

    const newStock = stock.filter(item => item.id !== id);

    setStock(newStock);

    saveData(selectedRestaurant.id, null, newStock);

  };


  // ===== CALCULS =====

  const totalVentes = caisse.ventes.reduce((sum, v) => sum + v.montant, 0);

  const totalDecaissements = caisse.decaissements.reduce((sum, d) => sum + d.montant, 0);

  const tresorerie = totalVentes - totalDecaissements;

  const totalStock = stock.reduce((sum, item) => sum + (item.quantite * item.prixUnitaire), 0);


  const ventesParCategorie = caisse.ventes.reduce((acc, v) => {

    const existing = acc.find(item => item.name === v.categorie);

    if (existing) {

      existing.value += v.montant;

    } else {

      acc.push({ name: v.categorie, value: v.montant });

    }

    return acc;

  }, []);


  const ventesParJour = caisse.ventes.reduce((acc, v) => {

    const jour = new Date(v.date).toLocaleDateString('fr-FR');

    const existing = acc.find(item => item.date === jour);

    if (existing) {

      existing.ventes += v.montant;

    } else {

      acc.push({ date: jour, ventes: v.montant });

    }

    return acc;

  }, []);


  // ===== LOGOUT =====

  const handleLogout = () => {

    setCurrentUser(null);

    setShowLogin(true);

    setSelectedRestaurant(null);

    setActiveTab('dashboard');

  };


  // ===== LOGIN SCREEN =====

  if (showLogin) {

    return (

      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-4">

        <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full">

          <div className="text-center mb-8">

            <h1 className="text-4xl font-bold text-blue-600 mb-2">RestaurantBook</h1>

            <p className="text-gray-600 text-sm">Comptabilité simple pour restaurants</p>

          </div>


          <form onSubmit={handleLogin} className="space-y-4">

            <div>

              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>

              <input

                type="email"

                value={loginEmail}

                onChange={(e) => setLoginEmail(e.target.value)}

                placeholder="owner@restaurant.com"

                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"

              />

            </div>

            <div>

              <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>

              <input

                type="password"

                value={loginPassword}

                onChange={(e) => setLoginPassword(e.target.value)}

                placeholder="••••••••"

                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"

              />

            </div>

            <button

              type="submit"

              className="w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition"

            >

              Se connecter

            </button>

          </form>


          <div className="mt-6 p-4 bg-blue-50 rounded-lg text-xs text-gray-600">

            <p><strong>Test Propriétaire :</strong> owner@restaurant.com / test123</p>

            <p><strong>Test Gérant :</strong> gerant@restaurant.com / test123</p>

          </div>

        </div>

      </div>

    );

  }


  // ===== SELECTION RESTAURANT =====

  if (!selectedRestaurant) {

    return (

      <div className="min-h-screen bg-gray-50">

        <div className="bg-white shadow">

          <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">

            <div>

              <h1 className="text-2xl font-bold text-gray-800">RestaurantBook</h1>

              <p className="text-sm text-gray-600">{currentUser?.name}</p>

            </div>

            <button

              onClick={handleLogout}

              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"

            >

              <LogOut size={18} />

              Déconnexion

            </button>

          </div>

        </div>


        <div className="max-w-7xl mx-auto px-4 py-8">

          <div className="mb-6">

            <button

              onClick={() => setShowNewRestaurant(!showNewRestaurant)}

              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"

            >

              <Plus size={18} />

              Ajouter un Restaurant

            </button>

          </div>


          {showNewRestaurant && (

            <form

              onSubmit={(e) => {

                e.preventDefault();

                const newRest = {

                  id: 'rest-' + Date.now(),

                  name: newRestaurantName,

                  owner: currentUser.id,

                  caisse: { ventes: [], decaissements: [] },

                  stock: [],

                  createdAt: new Date().toISOString()

                };

                setRestaurants(prev => {

                  const updated = { ...prev, [newRest.id]: newRest };

                  localStorage.setItem('restaurants', JSON.stringify(updated));

                  return updated;

                });

                setSelectedRestaurant(newRest);

                setNewRestaurantName('');

                setShowNewRestaurant(false);

              }}

              className="bg-white p-6 rounded-lg shadow mb-6"

            >

              <input

                type="text"

                value={newRestaurantName}

                onChange={(e) => setNewRestaurantName(e.target.value)}

                placeholder="Nom du restaurant"

                className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 outline-none"

              />

              <button

                type="submit"

                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"

              >

                Créer

              </button>

            </form>

          )}


          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

            {Object.values(restaurants)

              .filter(r => r.owner === currentUser.id)

              .map(restaurant => (

                <div

                  key={restaurant.id}

                  onClick={() => setSelectedRestaurant(restaurant)}

                  className="bg-white p-6 rounded-lg shadow cursor-pointer hover:shadow-lg transition"

                >

                  <h3 className="text-lg font-bold text-gray-800">{restaurant.name}</h3>

                  <p className="text-sm text-gray-500 mt-2">

                    Créé le {new Date(restaurant.createdAt).toLocaleDateString('fr-FR')}

                  </p>

                  <button className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">

                    Ouvrir

                  </button>

                </div>

              ))}

          </div>

        </div>

      </div>

    );

  }


  // ===== MAIN DASHBOARD =====

  const canEdit = currentUser.role === 'proprietaire' || currentUser.role === 'gerant';


  return (

    <div className="min-h-screen bg-gray-50">

      {/* HEADER */}

      <div className="bg-white shadow">

        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">

          <div>

            <button

              onClick={() => setSelectedRestaurant(null)}

              className="text-blue-600 hover:text-blue-800 text-sm font-medium mb-1"

            >

              ← Retour

            </button>

            <h1 className="text-2xl font-bold text-gray-800">{selectedRestaurant.name}</h1>

